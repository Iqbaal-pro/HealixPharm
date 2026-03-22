import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Ensure stdout uses UTF-8 if possible, though we'll stick to ASCII to be safe
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from src.preprocessing import load_and_clean_data, get_latest_prices
from src.visualization import plot_budget_distribution, plot_category_trends

FEATURES = [
    'Month', 'lag_1', 'lag_2', 'rolling_3', 'rolling_6', 
    'item_mean', 'item_std', 'n_months', 'item_encoded', 'cat_encoded'
]

def build_global_features(monthly_df: pd.DataFrame) -> pd.DataFrame:
    records = []
    # Faster grouping
    for (item, category), group in monthly_df.groupby(['Item', 'Category']):
        g = group.sort_values('Month').reset_index(drop=True)
        qty_mean = g['Qty'].mean()
        qty_std = g['Qty'].std() if len(g) > 1 else 0.0
        n_months = len(g)

        for i in range(len(g)):
            row = g.iloc[i]
            lag1 = float(g.iloc[i-1]['Qty']) if i >= 1 else qty_mean
            lag2 = float(g.iloc[i-2]['Qty']) if i >= 2 else qty_mean
            roll3 = float(g.iloc[max(0, i-3):i]['Qty'].mean()) if i >= 1 else qty_mean
            roll6 = float(g.iloc[max(0, i-6):i]['Qty'].mean()) if i >= 1 else qty_mean

            records.append({
                'Item': item, 'Category': category, 'Month': int(row['Month']),
                'lag_1': lag1, 'lag_2': lag2, 'rolling_3': roll3, 'rolling_6': roll6,
                'item_mean': qty_mean, 'item_std': qty_std, 'n_months': n_months,
                'Qty': float(row['Qty']),
            })
    return pd.DataFrame(records)

def run_prediction_pipeline():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    today = datetime.today()
    if today.month == 12:
        target_month, target_year = 1, today.year + 1
    else:
        target_month, target_year = today.month + 1, today.year
    month_name = datetime(target_year, target_month, 1).strftime('%B %Y')

    print("="*55)
    print(f"  HealixPharm Stock Prediction - {month_name}")
    print("  Model: Global Random Forest")
    print("="*55 + "\n")

    print("1. Loading and Preprocessing Data...")
    file_path = os.path.join(BASE_DIR, 'data', 'peoples pharmacy.xlsx')
    df = load_and_clean_data(file_path)

    data_dir = os.path.join(BASE_DIR, 'data')
    os.makedirs(data_dir, exist_ok=True)
    df.to_csv(os.path.join(data_dir, 'preprocessed_12_month_data.csv'), index=False, encoding='utf-8-sig')
    
    latest_prices = get_latest_prices(df)

    print("\n2. Aggregating Monthly Sales...")
    monthly_sales = df.groupby(['Item', 'Category', 'Month'])['Qty'].sum().reset_index().sort_values(['Item', 'Month']).reset_index(drop=True)
    
    print("\n3. Engineering Features for Global Model...")
    feat_df = build_global_features(monthly_sales)
    
    le_item = LabelEncoder()
    le_cat = LabelEncoder()
    feat_df['item_encoded'] = le_item.fit_transform(feat_df['Item'])
    feat_df['cat_encoded'] = le_cat.fit_transform(feat_df['Category'])

    print("\n4. Splitting Data for Evaluation...")
    train_rows, test_rows = [], []
    for _, group in feat_df.groupby('Item'):
        g = group.sort_values('Month').reset_index(drop=True)
        if len(g) >= 2:
            train_rows.append(g.iloc[:-1])
            test_rows.append(g.iloc[[-1]])
        else:
            train_rows.append(g)

    train_df = pd.concat(train_rows).reset_index(drop=True)
    test_df = pd.concat(test_rows).reset_index(drop=True)

    X_train, y_train = train_df[FEATURES], train_df['Qty']
    X_test, y_test = test_df[FEATURES], test_df['Qty']

    print("\n5. Training Global Random Forest Model...")
    eval_model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    eval_model.fit(X_train, y_train)
    y_pred_eval = np.maximum(eval_model.predict(X_test), 0)

    mae = mean_absolute_error(y_test, y_pred_eval)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred_eval))
    r2 = r2_score(y_test, y_pred_eval)
    mape = np.mean([abs((t - p) / t) * 100 for t, p in zip(y_test, y_pred_eval) if t != 0])

    if r2 >= 0.85:   verdict = "Excellent OK"
    elif r2 >= 0.70: verdict = "Good OK"
    elif r2 >= 0.50: verdict = "Acceptable WARN"
    else:            verdict = "Needs Improvement FAIL"

    print(f"\n   --- GLOBAL MODEL EVALUATION:")
    print(f"   |-- MAE   : {mae:.2f} units")
    print(f"   |-- RMSE  : {rmse:.2f} units")
    print(f"   |-- R2    : {r2:.4f} -> {verdict}")
    print(f"   |-- MAPE  : {mape:.2f}%")

    print("\n6. Retraining on Full Dataset for Final Predictions...")
    final_model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    final_model.fit(feat_df[FEATURES], feat_df['Qty'])

    print(f"\n7. Predicting {month_name} for All Items...")
    # Faster prediction loop
    pred_data = []
    for (item, category), group in monthly_sales.groupby(['Item', 'Category']):
        qty_vals = group.sort_values('Month')['Qty'].values
        qty_mean = qty_vals.mean()
        qty_std = qty_vals.std() if len(qty_vals) > 1 else 0.0
        n_months = len(qty_vals)

        pred_data.append({
            'Item': item, 'Category': category, 'Month': target_month,
            'lag_1': float(qty_vals[-1]),
            'lag_2': float(qty_vals[-2]) if len(qty_vals) >= 2 else qty_mean,
            'rolling_3': float(qty_vals[-3:].mean()) if len(qty_vals) >= 3 else qty_mean,
            'rolling_6': float(qty_vals[-6:].mean()) if len(qty_vals) >= 6 else qty_mean,
            'item_mean': qty_mean, 'item_std': qty_std, 'n_months': n_months,
            'item_encoded': le_item.transform([item])[0],
            'cat_encoded': le_cat.transform([category])[0]
        })

    X_pred = pd.DataFrame(pred_data)
    predictions = np.maximum(final_model.predict(X_pred[FEATURES]), 0)
    
    results = []
    month_col = f'Predicted_{month_name.replace(" ", "_")}_Qty'
    for i, row in X_pred.iterrows():
        results.append({
            'Item': row['Item'], 'Category': row['Category'],
            month_col: round(predictions[i])
        })

    print(f"   [+] Predictions generated for {len(results)} items")

    print("\n8. Applying 20% Safety Stock Buffer...")
    predictions_df = pd.DataFrame(results)
    predictions_df['Recommended_Stock'] = np.ceil(predictions_df[month_col] * 1.2).astype(int)

    print("\n9. Calculating Budget Requirements...")
    merged = pd.merge(predictions_df, latest_prices, on='Item', how='left').fillna(0)
    merged['Budget_Required'] = merged['Recommended_Stock'] * merged['Price']

    category_budget = merged.groupby('Category')['Budget_Required'].sum().reset_index().sort_values('Budget_Required', ascending=False)
    total_budget = category_budget['Budget_Required'].sum()

    print(f"   [+] Total estimated budget: Rs. {total_budget:,.2f}")

    print("\n10. Saving Reports...")
    reports_dir = os.path.join(BASE_DIR, 'outputs', 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    category_budget.to_csv(os.path.join(reports_dir, 'frontend_category_budgets.csv'), index=False, encoding='utf-8-sig')
    merged.to_csv(os.path.join(reports_dir, 'detailed_inventory_plan.csv'), index=False, encoding='utf-8-sig')
    
    # Save a small JSON for the dashboard
    eval_out = pd.DataFrame({
        'Metric': ['MAE', 'RMSE', 'R2_Score', 'MAPE (%)'],
        'Value':  [mae, rmse, r2, mape]
    })
    eval_out.to_csv(os.path.join(reports_dir, 'model_evaluation.csv'), index=False, encoding='utf-8-sig')
    
    print("\n11. Generating Visualizations...")
    charts_dir = os.path.join(BASE_DIR, 'outputs', 'charts')
    plot_budget_distribution(category_budget, output_folder=charts_dir)
    plot_category_trends(df, output_folder=charts_dir)

    print("\n" + "="*55)
    print("OK Pipeline Complete!")
    print(f"   Target month   : {month_name}")
    print(f"   R2 Score       : {r2:.4f}")
    print(f"   Total budget   : Rs. {total_budget:,.2f}")
    print("="*55)

if __name__ == "__main__":
    run_prediction_pipeline()
