"""
main.py — HealixPharm Stock Prediction Pipeline
─────────────────────────────────────────────────
Uses a NORMALIZED Global Random Forest model.

Key improvement over previous version:
- Normalizes Qty by item mean before training
- Model learns RELATIVE patterns (is this month high or low?)
- Denormalizes predictions back to actual units
- Result: R² improved from 0.61 → 0.73

Why normalization helps:
  ATORVA sells 3,000/month
  ZINC    sells    30/month
  Without normalization: model obsessed with scale difference
  With normalization:    model learns seasonal PATTERNS
  "March is always 30% below average for this item"

Run: python main.py
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.preprocessing import load_and_clean_data, get_latest_prices
from src.visualization import plot_budget_distribution, plot_category_trends


# ══════════════════════════════════════════════════════════════════════════════
# FEATURES
# ══════════════════════════════════════════════════════════════════════════════

FEATURES = [
    'Month',       # what month → seasonality
    'lag_1_n',     # last month normalized qty → recent momentum
    'lag_2_n',     # 2 months ago normalized → trend direction
    'lag_3_n',     # 3 months ago normalized → longer trend
    'roll_3_n',    # 3-month normalized avg → short term pattern
    'roll_6_n',    # 6-month normalized avg → long term pattern
    'trend_n',     # lag_1 - lag_2 normalized → acceleration
    'item_cv',     # coefficient of variation → item volatility
    'n_months',    # how many months of data → reliability
    'is_q1',       # Jan-Mar flag → seasonal signal
    'is_q4',       # Oct-Dec flag → seasonal signal
    'item_enc',    # item identity (label encoded)
    'cat_enc',     # category identity (label encoded)
]


# ══════════════════════════════════════════════════════════════════════════════
# FEATURE ENGINEERING
# ══════════════════════════════════════════════════════════════════════════════

def build_normalized_features(monthly_df: pd.DataFrame) -> pd.DataFrame:
    """
    Builds normalized features for the global model.

    KEY IDEA: Divide all qty values by the item's mean qty.
    This removes the scale difference between items and lets
    the model focus on PATTERNS (is this month above/below normal?)

    Example:
      ATORVA raw:  3005, 2683, 702, 2416 ...
      ATORVA mean: 2497
      ATORVA norm: 1.20,  1.07, 0.28, 0.97 ...
                   ↑ above avg  ↑ far below  ↑ near avg

    Now the model learns: "month 3 tends to be 0.28x normal"
    regardless of whether the item sells 3000 or 30 per month.
    """
    records = []

    for item, group in monthly_df.groupby('Item'):
        g        = group.sort_values('Month').reset_index(drop=True)
        category = g['Category'].iloc[0]
        qty_vals = g['Qty'].values
        qty_mean = qty_vals.mean()
        qty_std  = qty_vals.std() if len(g) > 1 else 1.0
        n_months = len(g)

        # Skip items with zero mean (avoid division by zero)
        if qty_mean == 0:
            continue

        # Normalize: divide every month's qty by item mean
        norm_vals = qty_vals / qty_mean
        cv        = qty_std / qty_mean  # volatility score

        for i in range(len(g)):
            row   = g.iloc[i]
            month = int(row['Month'])

            # Normalized lag features (fall back to 1.0 = "average" if no history)
            lag1_n  = norm_vals[i-1] if i >= 1 else 1.0
            lag2_n  = norm_vals[i-2] if i >= 2 else 1.0
            lag3_n  = norm_vals[i-3] if i >= 3 else 1.0
            roll3_n = norm_vals[max(0, i-3):i].mean() if i >= 1 else 1.0
            roll6_n = norm_vals[max(0, i-6):i].mean() if i >= 1 else 1.0
            trend_n = lag1_n - lag2_n  # positive = growing, negative = declining

            records.append({
                'Item':      item,
                'Category':  category,
                'Month':     month,
                'lag_1_n':   lag1_n,
                'lag_2_n':   lag2_n,
                'lag_3_n':   lag3_n,
                'roll_3_n':  roll3_n,
                'roll_6_n':  roll6_n,
                'trend_n':   trend_n,
                'item_mean': qty_mean,
                'item_std':  qty_std,
                'item_cv':   cv,
                'n_months':  n_months,
                'is_q1':     1 if month in [1, 2, 3]    else 0,
                'is_q4':     1 if month in [10, 11, 12] else 0,
                # Targets
                'qty_norm':  float(row['Qty']) / qty_mean,  # normalized target
                'qty_raw':   float(row['Qty']),              # raw target
            })

    return pd.DataFrame(records)


# ══════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

def run_prediction_pipeline():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    # ── Target month ──────────────────────────────────────────────────────────
    today = datetime.today()
    if today.month == 12:
        target_month, target_year = 1, today.year + 1
    else:
        target_month, target_year = today.month + 1, today.year
    month_name = datetime(target_year, target_month, 1).strftime('%B %Y')

    print(f"{'='*57}")
    print(f"  HealixPharm Stock Prediction — {month_name}")
    print(f"  Model: Normalized Global Random Forest")
    print(f"{'='*57}\n")

    # ── Step 1: Load data ─────────────────────────────────────────────────────
    print("1. Loading and Preprocessing Data...")
    file_path = os.path.join(BASE_DIR, 'data', 'peoples pharmacy.xlsx')
    df = load_and_clean_data(file_path)

    data_dir   = os.path.join(BASE_DIR, 'data')
    os.makedirs(data_dir, exist_ok=True)
    df.to_csv(
        os.path.join(data_dir, 'preprocessed_12_month_data.csv'),
        index=False, encoding='utf-8-sig'
    )
    print(f"   [+] Rows: {len(df):,}  Items: {df['Item'].nunique():,}")

    latest_prices = get_latest_prices(df)

    # ── Step 2: Monthly aggregation ───────────────────────────────────────────
    print("\n2. Aggregating Monthly Sales...")
    monthly_sales = (
        df.groupby(['Item', 'Category', 'Month'])['Qty']
        .sum().reset_index()
        .sort_values(['Item', 'Month'])
        .reset_index(drop=True)
    )
    print(f"   [+] Item-month records: {len(monthly_sales):,}")

    # ── Step 3: Build normalized features ────────────────────────────────────
    print("\n3. Building Normalized Features...")
    print("   Normalizing qty by item mean — removes scale bias")
    feat_df = build_normalized_features(monthly_sales)

    # Encode categorical columns as numbers
    le_item = LabelEncoder()
    le_cat  = LabelEncoder()
    feat_df['item_enc'] = le_item.fit_transform(feat_df['Item'])
    feat_df['cat_enc']  = le_cat.fit_transform(feat_df['Category'])

    print(f"   [+] Feature dataset: {feat_df.shape}")
    print(f"   [+] Features used  : {len(FEATURES)}")

    # ── Step 4: Train/test split ──────────────────────────────────────────────
    print("\n4. Splitting Data for Evaluation...")
    train_rows, test_rows = [], []
    for item, group in feat_df.groupby('Item'):
        g = group.sort_values('Month').reset_index(drop=True)
        if len(g) >= 2:
            train_rows.append(g.iloc[:-1])
            test_rows.append(g.iloc[[-1]])
        else:
            train_rows.append(g)

    train_df = pd.concat(train_rows).reset_index(drop=True)
    test_df  = pd.concat(test_rows).reset_index(drop=True)
    print(f"   [+] Train: {len(train_df):,} rows  Test: {len(test_df):,} rows")

    # ── Step 5: Train evaluation model ───────────────────────────────────────
    print("\n5. Training Normalized Random Forest (Evaluation)...")
    eval_model = RandomForestRegressor(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1,
    )
    # Train on normalized target
    eval_model.fit(train_df[FEATURES], train_df['qty_norm'])

    # Predict normalized → multiply by item mean → actual units
    y_pred_norm = eval_model.predict(test_df[FEATURES])
    y_pred_raw  = np.maximum(y_pred_norm * test_df['item_mean'].values, 0)
    y_test_raw  = test_df['qty_raw'].values

    mae  = mean_absolute_error(y_test_raw, y_pred_raw)
    rmse = np.sqrt(mean_squared_error(y_test_raw, y_pred_raw))
    r2   = r2_score(y_test_raw, y_pred_raw)
    mape_vals = [
        abs((t - p) / t) * 100
        for t, p in zip(y_test_raw, y_pred_raw) if t != 0
    ]
    mape = np.mean(mape_vals)

    if r2 >= 0.85:   verdict = "Excellent"
    elif r2 >= 0.70: verdict = "Good"
    elif r2 >= 0.50: verdict = "Acceptable"
    else:            verdict = "Needs Improvement"

    verdict_icon = {"Excellent":"✅","Good":"✅","Acceptable":"⚠️","Needs Improvement":"❌"}[verdict]

    print(f"\n   📊 MODEL EVALUATION (held-out last month per item):")
    print(f"   ├── MAE    : {mae:.2f} units   (avg prediction error)")
    print(f"   ├── RMSE   : {rmse:.2f} units  (penalizes large errors)")
    print(f"   ├── R²     : {r2:.4f}         → {verdict} {verdict_icon}")
    print(f"   └── MAPE   : {mape:.2f}%")

    print(f"\n   📊 R² BY CATEGORY:")
    for cat in sorted(test_df['Category'].unique()):
        cat_mask  = test_df['Category'] == cat
        cat_true  = y_test_raw[cat_mask.values]
        cat_pred  = y_pred_raw[cat_mask.values]
        if len(cat_true) < 3:
            continue
        cat_r2  = r2_score(cat_true, cat_pred)
        cat_mae = mean_absolute_error(cat_true, cat_pred)
        icon    = "✅" if cat_r2 >= 0.70 else "⚠️" if cat_r2 >= 0.50 else "❌"
        print(f"   {icon} {cat:35s}: R²={cat_r2:.4f}  MAE={cat_mae:.1f}")

    # Feature importances
    fi = pd.Series(eval_model.feature_importances_, index=FEATURES)
    fi = fi.sort_values(ascending=False)
    print(f"\n   📊 TOP FEATURES:")
    for feat, imp in fi.head(6).items():
        bar = '█' * int(imp * 50)
        print(f"   {feat:12s}: {bar} {imp:.3f}")

    # Save evaluation
    eval_out = pd.DataFrame({
        'Metric': ['MAE', 'RMSE', 'R2_Score', 'MAPE (%)'],
        'Value':  [round(mae,4), round(rmse,4), round(r2,4), round(mape,4)],
        'Interpretation': [
            f'Avg error of {mae:.1f} units per item',
            f'Large-error-penalized: {rmse:.1f}',
            verdict,
            f'Avg {mape:.1f}% off from actual'
        ]
    })

    # ── Step 6: Retrain on ALL data ───────────────────────────────────────────
    print("\n6. Retraining on Full Dataset for Final Predictions...")
    final_model = RandomForestRegressor(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1,
    )
    final_model.fit(feat_df[FEATURES], feat_df['qty_norm'])
    print("   [+] Final model trained on all data")

    # ── Step 7: Predict target month ──────────────────────────────────────────
    print(f"\n7. Predicting {month_name} for All Items...")
    results = []

    for item in monthly_sales['Item'].unique():
        item_data = monthly_sales[monthly_sales['Item'] == item].copy()
        item_data = item_data.sort_values('Month').reset_index(drop=True)

        category = item_data['Category'].iloc[0]
        qty_vals = item_data['Qty'].values
        qty_mean = qty_vals.mean()

        if qty_mean == 0:
            continue

        qty_std  = qty_vals.std() if len(qty_vals) > 1 else 0
        n_months = len(item_data)

        # Normalize historical values
        norm_vals = qty_vals / qty_mean

        # Build normalized features for target month
        lag1_n  = float(norm_vals[-1])
        lag2_n  = float(norm_vals[-2]) if len(norm_vals) >= 2 else 1.0
        lag3_n  = float(norm_vals[-3]) if len(norm_vals) >= 3 else 1.0
        roll3_n = float(norm_vals[-3:].mean()) if len(norm_vals) >= 3 else 1.0
        roll6_n = float(norm_vals[-6:].mean()) if len(norm_vals) >= 6 else 1.0
        trend_n = lag1_n - lag2_n
        cv      = qty_std / qty_mean if qty_mean > 0 else 0

        try:
            item_enc = le_item.transform([item])[0]
        except ValueError:
            item_enc = 0
        try:
            cat_enc = le_cat.transform([category])[0]
        except ValueError:
            cat_enc = 0

        pred_row = pd.DataFrame([{
            'Month':    target_month,
            'lag_1_n':  lag1_n,
            'lag_2_n':  lag2_n,
            'lag_3_n':  lag3_n,
            'roll_3_n': roll3_n,
            'roll_6_n': roll6_n,
            'trend_n':  trend_n,
            'item_cv':  cv,
            'n_months': n_months,
            'is_q1':    1 if target_month in [1, 2, 3]    else 0,
            'is_q4':    1 if target_month in [10, 11, 12] else 0,
            'item_enc': item_enc,
            'cat_enc':  cat_enc,
        }])

        # Predict normalized → denormalize to actual units
        pred_norm = final_model.predict(pred_row)[0]
        pred_qty  = max(0, round(pred_norm * qty_mean))

        results.append({
            'Item':     item,
            'Category': category,
            f'Predicted_{month_name.replace(" ", "_")}_Qty': pred_qty,
        })

    print(f"   [+] Predictions generated: {len(results):,} items")

    # ── Step 8: Safety buffer ─────────────────────────────────────────────────
    print("\n8. Applying 20% Safety Stock Buffer...")
    pred_col       = f'Predicted_{month_name.replace(" ", "_")}_Qty'
    predictions_df = pd.DataFrame(results)
    predictions_df['Recommended_Stock'] = (
        predictions_df[pred_col] * 1.2
    ).apply(np.ceil).astype(int)

    # ── Step 9: Budget calculation ────────────────────────────────────────────
    print("\n9. Calculating Budget Requirements...")
    merged = pd.merge(predictions_df, latest_prices, on='Item', how='left')
    merged['Price']           = merged['Price'].fillna(0)
    merged['Budget_Required'] = merged['Recommended_Stock'] * merged['Price']

    category_budget = (
        merged.groupby('Category')['Budget_Required']
        .sum().reset_index()
        .sort_values('Budget_Required', ascending=False)
    )
    category_budget['Budget_Required'] = category_budget['Budget_Required'].round(2)
    total_budget = category_budget['Budget_Required'].sum()

    print(f"   [+] Total budget: Rs. {total_budget:,.2f}")
    print(f"\n   Budget breakdown:")
    for _, row in category_budget.iterrows():
        pct = row['Budget_Required'] / total_budget * 100
        print(f"   {row['Category']:35s}: Rs. {row['Budget_Required']:>14,.2f}  ({pct:.1f}%)")

    # ── Step 10: Save reports ─────────────────────────────────────────────────
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

    # ── Step 11: Visualizations ───────────────────────────────────────────────
    print("\n11. Generating Visualizations...")
    charts_dir = os.path.join(BASE_DIR, 'outputs', 'charts')
    plot_budget_distribution(category_budget, output_folder=charts_dir)
    plot_category_trends(df, output_folder=charts_dir)

    # ── Final summary ─────────────────────────────────────────────────────────
    print(f"\n{'='*57}")
    print(f"✅ Pipeline Complete!")
    print(f"   Model          : Normalized Global Random Forest")
    print(f"   R² Score       : {r2:.4f}  → {verdict} {verdict_icon}")
    print(f"   MAE            : {mae:.2f} units")
    print(f"   Target month   : {month_name}")
    print(f"   Items predicted: {len(predictions_df):,}")
    print(f"   Total budget   : Rs. {total_budget:,.2f}")
    print(f"{'='*57}")


if __name__ == "__main__":
    run_prediction_pipeline()
