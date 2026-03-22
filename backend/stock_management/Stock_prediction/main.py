"""
main.py — HealixPharm Stock Prediction Pipeline
─────────────────────────────────────────────────
Uses a GLOBAL Random Forest model trained on ALL items together.

Why global model?
- Per-item model: 5,024 models × 11 rows each = poor learning
- Global model:   1 model × 28,036 rows = much better learning

The model learns cross-item patterns:
"Cardiovascular drugs with high recent sales tend to
 stay high in April" — knowledge shared across all items.

Run: python main.py
"""

import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.preprocessing import load_and_clean_data, get_latest_prices
from src.visualization import plot_budget_distribution, plot_category_trends


# ══════════════════════════════════════════════════════════════════════════════
# FEATURE ENGINEERING
# ══════════════════════════════════════════════════════════════════════════════

def build_global_features(monthly_df: pd.DataFrame) -> pd.DataFrame:
    """
    Builds a rich feature set for the GLOBAL model.

    For each item-month row, creates:
      lag_1      → last month's qty        (momentum)
      lag_2      → 2 months ago qty        (trend direction)
      rolling_3  → 3-month average         (short term trend)
      rolling_6  → 6-month average         (long term baseline)
      item_mean  → item's overall avg qty  (item scale reference)
      item_std   → item's qty std dev      (volatility)
      n_months   → how many months of data (data reliability)

    For items missing earlier months, uses item mean as fallback
    instead of dropping rows — keeps ALL 28,036 records.
    """
    records = []

    for item, group in monthly_df.groupby('Item'):
        g        = group.sort_values('Month').reset_index(drop=True)
        category = g['Category'].iloc[0]
        qty_mean = g['Qty'].mean()
        qty_std  = g['Qty'].std() if len(g) > 1 else 0.0
        n_months = len(g)

        for i in range(len(g)):
            row = g.iloc[i]

            # Lag features — fall back to item mean if not enough history
            lag1  = float(g.iloc[i-1]['Qty']) if i >= 1 else qty_mean
            lag2  = float(g.iloc[i-2]['Qty']) if i >= 2 else qty_mean
            roll3 = float(g.iloc[max(0, i-3):i]['Qty'].mean()) if i >= 1 else qty_mean
            roll6 = float(g.iloc[max(0, i-6):i]['Qty'].mean()) if i >= 1 else qty_mean

            records.append({
                'Item':      item,
                'Category':  category,
                'Month':     int(row['Month']),
                'lag_1':     lag1,
                'lag_2':     lag2,
                'rolling_3': roll3,
                'rolling_6': roll6,
                'item_mean': qty_mean,
                'item_std':  qty_std,
                'n_months':  n_months,
                'Qty':       float(row['Qty']),
            })

    return pd.DataFrame(records)


# Features used by the model — ORDER MATTERS (must match predict time)
FEATURES = [
    'Month',        # what month → seasonality
    'lag_1',        # last month sales → momentum
    'lag_2',        # 2 months ago → trend direction
    'rolling_3',    # 3-month avg → short term trend
    'rolling_6',    # 6-month avg → long term baseline
    'item_mean',    # item's overall avg → scale reference
    'item_std',     # item's volatility → uncertainty signal
    'n_months',     # data reliability → how much history
    'item_encoded', # which item → item identity
    'cat_encoded',  # which category → category patterns
]


# ══════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

def run_prediction_pipeline():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    # ── Determine target month ────────────────────────────────────────────────
    today = datetime.today()
    if today.month == 12:
        target_month, target_year = 1, today.year + 1
    else:
        target_month, target_year = today.month + 1, today.year
    month_name = datetime(target_year, target_month, 1).strftime('%B %Y')

    print(f"{'='*55}")
    print(f"  HealixPharm Stock Prediction — {month_name}")
    print(f"  Model: Global Random Forest")
    print(f"{'='*55}\n")

    # ── Step 1: Load and clean data ───────────────────────────────────────────
    print("1. Loading and Preprocessing Data...")
    file_path = os.path.join(BASE_DIR, 'data', 'peoples pharmacy.xlsx')
    df = load_and_clean_data(file_path)

    # Save preprocessed CSV for API and visualization
    data_dir   = os.path.join(BASE_DIR, 'data')
    os.makedirs(data_dir, exist_ok=True)
    output_csv = os.path.join(data_dir, 'preprocessed_12_month_data.csv')
    df.to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"   [+] Saved: {output_csv}")

    latest_prices = get_latest_prices(df)

    # ── Step 2: Monthly aggregation ───────────────────────────────────────────
    print("\n2. Aggregating Monthly Sales...")
    monthly_sales = (
        df.groupby(['Item', 'Category', 'Month'])['Qty']
        .sum()
        .reset_index()
        .sort_values(['Item', 'Month'])
        .reset_index(drop=True)
    )
    print(f"   [+] Item-month records : {len(monthly_sales)}")
    print(f"   [+] Unique items       : {monthly_sales['Item'].nunique()}")

    # ── Step 3: Build global feature dataset ──────────────────────────────────
    print("\n3. Engineering Features for Global Model...")
    feat_df = build_global_features(monthly_sales)
    print(f"   [+] Feature dataset shape: {feat_df.shape}")

    # Encode item names and categories as numbers
    # (Random Forest needs numbers, not strings)
    le_item = LabelEncoder()
    le_cat  = LabelEncoder()
    feat_df['item_encoded'] = le_item.fit_transform(feat_df['Item'])
    feat_df['cat_encoded']  = le_cat.fit_transform(feat_df['Category'])

    # ── Step 4: Train/test split for evaluation ───────────────────────────────
    print("\n4. Splitting Data for Evaluation...")
    train_rows, test_rows = [], []

    for item, group in feat_df.groupby('Item'):
        g = group.sort_values('Month').reset_index(drop=True)
        if len(g) >= 2:
            train_rows.append(g.iloc[:-1])   # all except last month
            test_rows.append(g.iloc[[-1]])    # last month = test
        else:
            train_rows.append(g)              # too few → train only

    train_df = pd.concat(train_rows).reset_index(drop=True)
    test_df  = pd.concat(test_rows).reset_index(drop=True)

    print(f"   [+] Training rows : {len(train_df)}")
    print(f"   [+] Test rows     : {len(test_df)}")

    X_train = train_df[FEATURES]
    y_train = train_df['Qty']
    X_test  = test_df[FEATURES]
    y_test  = test_df['Qty']

    # ── Step 5: Train global model ────────────────────────────────────────────
    print("\n5. Training Global Random Forest Model...")
    print("   (One model on ALL 28,036 rows — not 5,024 separate models)")

    # Train evaluation model (on train split)
    eval_model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,        # use all CPU cores → faster training
    )
    eval_model.fit(X_train, y_train)
    y_pred_eval = np.maximum(eval_model.predict(X_test), 0)

    # Calculate metrics
    mae  = mean_absolute_error(y_test, y_pred_eval)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred_eval))
    r2   = r2_score(y_test, y_pred_eval)
    mape_vals = [
        abs((t - p) / t) * 100
        for t, p in zip(y_test, y_pred_eval) if t != 0
    ]
    mape = np.mean(mape_vals)

    if r2 >= 0.85:   verdict = "Excellent ✅"
    elif r2 >= 0.70: verdict = "Good ✅"
    elif r2 >= 0.50: verdict = "Acceptable ⚠️"
    else:            verdict = "Needs Improvement ❌"

    print(f"\n   📊 GLOBAL MODEL EVALUATION:")
    print(f"   ├── MAE   : {mae:.2f} units")
    print(f"   ├── RMSE  : {rmse:.2f} units")
    print(f"   ├── R²    : {r2:.4f}  → {verdict}")
    print(f"   └── MAPE  : {mape:.2f}%")

    # Feature importance
    fi = pd.Series(eval_model.feature_importances_, index=FEATURES)
    fi = fi.sort_values(ascending=False)
    print(f"\n   📊 TOP FEATURES (what drives predictions):")
    for feat, imp in fi.head(5).items():
        bar = '█' * int(imp * 40)
        print(f"   {feat:15s}: {bar} {imp:.3f}")

    # Save evaluation
    eval_out = pd.DataFrame({
        'Metric': ['MAE', 'RMSE', 'R2_Score', 'MAPE (%)'],
        'Value':  [round(mae,4), round(rmse,4), round(r2,4), round(mape,4)],
        'Interpretation': [
            f'Avg error of {mae:.1f} units per item',
            f'Large-error-penalized: {rmse:.1f}',
            verdict.replace(' ✅','').replace(' ⚠️','').replace(' ❌',''),
            f'Avg {mape:.1f}% off from actual'
        ]
    })

    # ── Step 6: Retrain on ALL data for final predictions ─────────────────────
    print("\n6. Retraining on Full Dataset for Final Predictions...")
    final_model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
    )
    X_all = feat_df[FEATURES]
    y_all = feat_df['Qty']
    final_model.fit(X_all, y_all)
    print("   [+] Final model trained on all data")

    # ── Step 7: Predict target month for every item ───────────────────────────
    print(f"\n7. Predicting {month_name} for All Items...")

    results = []
    items = monthly_sales['Item'].unique()

    for item in items:
        item_data = monthly_sales[monthly_sales['Item'] == item].copy()
        item_data = item_data.sort_values('Month').reset_index(drop=True)

        category = item_data['Category'].iloc[0]
        qty_vals = item_data['Qty'].values
        qty_mean = qty_vals.mean()
        qty_std  = qty_vals.std() if len(qty_vals) > 1 else 0.0
        n_months = len(item_data)

        # Build the feature row for target month
        lag1  = float(qty_vals[-1])                           # most recent month
        lag2  = float(qty_vals[-2]) if len(qty_vals) >= 2 else qty_mean
        roll3 = float(qty_vals[-3:].mean()) if len(qty_vals) >= 3 else qty_mean
        roll6 = float(qty_vals[-6:].mean()) if len(qty_vals) >= 6 else qty_mean

        # Encode item and category
        # Handle unseen items gracefully
        try:
            item_enc = le_item.transform([item])[0]
        except ValueError:
            item_enc = 0
        try:
            cat_enc = le_cat.transform([category])[0]
        except ValueError:
            cat_enc = 0

        pred_row = pd.DataFrame([{
            'Month':      target_month,
            'lag_1':      lag1,
            'lag_2':      lag2,
            'rolling_3':  roll3,
            'rolling_6':  roll6,
            'item_mean':  qty_mean,
            'item_std':   qty_std,
            'n_months':   n_months,
            'item_encoded': item_enc,
            'cat_encoded':  cat_enc,
        }])

        predicted_qty = max(0, round(final_model.predict(pred_row)[0]))

        results.append({
            'Item':     item,
            'Category': category,
            f'Predicted_{month_name.replace(" ", "_")}_Qty': predicted_qty,
        })

    print(f"   [+] Predictions generated for {len(results)} items")

    # ── Step 8: Apply 20% safety buffer ───────────────────────────────────────
    print("\n8. Applying 20% Safety Stock Buffer...")
    pred_col = f'Predicted_{month_name.replace(" ", "_")}_Qty'
    predictions_df = pd.DataFrame(results)
    predictions_df['Recommended_Stock'] = (
        predictions_df[pred_col] * 1.2
    ).apply(np.ceil).astype(int)

    # ── Step 9: Calculate budgets ─────────────────────────────────────────────
    print("\n9. Calculating Budget Requirements...")
    merged = pd.merge(predictions_df, latest_prices, on='Item', how='left')
    merged['Price']          = merged['Price'].fillna(0)
    merged['Budget_Required'] = merged['Recommended_Stock'] * merged['Price']

    category_budget = (
        merged.groupby('Category')['Budget_Required']
        .sum()
        .reset_index()
        .sort_values('Budget_Required', ascending=False)
    )
    category_budget['Budget_Required'] = category_budget['Budget_Required'].round(2)
    total_budget = category_budget['Budget_Required'].sum()

    print(f"   [+] Total estimated budget: Rs. {total_budget:,.2f}")
    print(f"\n   Budget by category:")
    for _, row in category_budget.iterrows():
        pct = row['Budget_Required'] / total_budget * 100
        print(f"   {row['Category']:30s}: Rs. {row['Budget_Required']:>14,.2f}  ({pct:.1f}%)")

    # ── Step 10: Save all reports ─────────────────────────────────────────────
    print("\n10. Saving Reports...")
    reports_dir = os.path.join(BASE_DIR, 'outputs', 'reports')
    os.makedirs(reports_dir, exist_ok=True)

    category_budget.to_csv(
        os.path.join(reports_dir, 'frontend_category_budgets.csv'),
        index=False, encoding='utf-8-sig'
    )
    category_budget.to_json(
        os.path.join(reports_dir, 'frontend_category_budgets.json'),
        orient='records'
    )
    merged.to_csv(
        os.path.join(reports_dir, 'detailed_inventory_plan.csv'),
        index=False, encoding='utf-8-sig'
    )
    eval_out.to_csv(
        os.path.join(reports_dir, 'model_evaluation.csv'),
        index=False, encoding='utf-8-sig'
    )
    print(f"   [+] Reports saved to {reports_dir}")

    # ── Step 11: Generate charts ──────────────────────────────────────────────
    print("\n11. Generating Visualizations...")
    charts_dir = os.path.join(BASE_DIR, 'outputs', 'charts')
    plot_budget_distribution(category_budget, output_folder=charts_dir)
    plot_category_trends(df, output_folder=charts_dir)

    # ── Final summary ─────────────────────────────────────────────────────────
    print(f"\n{'='*55}")
    print(f"✅ Pipeline Complete!")
    print(f"   Model          : Global Random Forest")
    print(f"   Training rows  : {len(feat_df):,}")
    print(f"   Target month   : {month_name}")
    print(f"   Items predicted: {len(predictions_df):,}")
    print(f"   R² Score       : {r2:.4f}  ({verdict})")
    print(f"   Total budget   : Rs. {total_budget:,.2f}")
    print(f"{'='*55}")


if __name__ == "__main__":
    run_prediction_pipeline()
