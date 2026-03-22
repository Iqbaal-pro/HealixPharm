"""
experiment_models.py
────────────────────
Run this SEPARATELY from main.py to test and compare different ML models.
main.py is NOT touched. This is a pure experimentation file.

Usage:
    python experiment_models.py

Output:
    - Prints comparison table of all models
    - Saves outputs/reports/model_comparison.csv
"""

import os
import sys
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.linear_model import Ridge, LinearRegression
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ── make sure src/ is importable ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
from src.preprocessing import load_and_clean_data

# ══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════
DATA_FILE    = os.path.join(BASE_DIR, 'data', 'peoples pharmacy.xlsx')
REPORTS_DIR  = os.path.join(BASE_DIR, 'outputs', 'reports')
TARGET_MONTH = 4   # April

# Models to compare — add or remove freely
MODELS = {
    'Random Forest (current)' : RandomForestRegressor(n_estimators=100, random_state=42),
    'Extra Trees'             : ExtraTreesRegressor(n_estimators=100, random_state=42),
    'Gradient Boosting'       : GradientBoostingRegressor(n_estimators=100, random_state=42),
    'Ridge Regression'        : Ridge(alpha=1.0),
    'Linear Regression'       : LinearRegression(),
    'KNN (k=3)'               : KNeighborsRegressor(n_neighbors=3),
}

# ══════════════════════════════════════════════════════════════════════════════
# STEP 1 — Load & prepare data
# ══════════════════════════════════════════════════════════════════════════════
print("=" * 60)
print("  PHARMACY STOCK PREDICTION — MODEL COMPARISON")
print("=" * 60)

print("\n[1] Loading data...")
df = load_and_clean_data(DATA_FILE)

monthly_sales = df.groupby(['Item', 'Category', 'Month'])['Qty'].sum().reset_index()
monthly_sales = monthly_sales.sort_values(['Item', 'Month']).reset_index(drop=True)

# Only use items with all 12 months — cleanest comparison
item_month_counts = monthly_sales.groupby('Item')['Month'].count()
items_12 = item_month_counts[item_month_counts == 12].index
data_12  = monthly_sales[monthly_sales['Item'].isin(items_12)].copy()

print(f"   Items with full 12 months : {len(items_12)}")
print(f"   Total records             : {len(data_12)}")

# ══════════════════════════════════════════════════════════════════════════════
# STEP 2 — Build features
# ══════════════════════════════════════════════════════════════════════════════
print("\n[2] Engineering features...")

def build_features(item_data):
    """
    For a single item's 12-month series, build:
      Month, lag_1, lag_2, rolling_3, rolling_6
    Returns X (features) and y (target).
    """
    d = item_data.sort_values('Month').reset_index(drop=True).copy()
    d['lag_1']     = d['Qty'].shift(1)
    d['lag_2']     = d['Qty'].shift(2)
    d['rolling_3'] = d['Qty'].shift(1).rolling(3).mean()
    d['rolling_6'] = d['Qty'].shift(1).rolling(6).mean()
    d = d.dropna()
    features = ['Month', 'lag_1', 'lag_2', 'rolling_3', 'rolling_6']
    return d[features], d['Qty']

# ══════════════════════════════════════════════════════════════════════════════
# STEP 3 — Evaluate every model
# ══════════════════════════════════════════════════════════════════════════════
print("\n[3] Evaluating models (hold-out last month per item)...\n")

comparison_results = []

for model_name, model in MODELS.items():
    y_true_all = []
    y_pred_all = []
    april_predictions = []

    for item in items_12:
        item_data = data_12[data_12['Item'] == item]
        X, y = build_features(item_data)

        if len(X) < 3:
            continue

        # Hold-out last row for evaluation
        X_train, X_test = X.iloc[:-1], X.iloc[[-1]]
        y_train, y_test = y.iloc[:-1], y.iloc[-1]

        try:
            model.fit(X_train, y_train)
            y_pred = max(0, model.predict(X_test)[0])
            y_true_all.append(y_test)
            y_pred_all.append(y_pred)

            # Also predict April using all data
            model.fit(X, y)
            last_row  = item_data.sort_values('Month').iloc[-1]
            lag1      = last_row['Qty']
            lag2      = item_data.sort_values('Month').iloc[-2]['Qty']
            roll3     = item_data.sort_values('Month').tail(3)['Qty'].mean()
            roll6     = item_data.sort_values('Month').tail(6)['Qty'].mean()
            april_row = pd.DataFrame([{
                'Month': TARGET_MONTH,
                'lag_1': lag1, 'lag_2': lag2,
                'rolling_3': roll3, 'rolling_6': roll6
            }])
            april_pred = max(0, model.predict(april_row)[0])
            april_predictions.append(april_pred)

        except Exception:
            continue

    # ── Metrics ───────────────────────────────────────────────────────────────
    if not y_true_all:
        continue

    mae  = mean_absolute_error(y_true_all, y_pred_all)
    rmse = np.sqrt(mean_squared_error(y_true_all, y_pred_all))
    r2   = r2_score(y_true_all, y_pred_all)
    mape_vals = [abs((t-p)/t)*100 for t,p in zip(y_true_all, y_pred_all) if t != 0]
    mape = np.mean(mape_vals)
    avg_april_pred = np.mean(april_predictions)

    if r2 >= 0.85:   verdict = "Excellent ✅"
    elif r2 >= 0.70: verdict = "Good ✅"
    elif r2 >= 0.50: verdict = "Acceptable ⚠️"
    else:            verdict = "Needs Work ❌"

    comparison_results.append({
        'Model'             : model_name,
        'MAE (units)'       : round(mae, 2),
        'RMSE (units)'      : round(rmse, 2),
        'R²'                : round(r2, 4),
        'MAPE (%)'          : round(mape, 2),
        'Avg April Pred'    : round(avg_april_pred, 1),
        'Verdict'           : verdict,
    })

    print(f"  ✔ {model_name:<30} MAE={mae:7.1f}  RMSE={rmse:8.1f}  R²={r2:.4f}  MAPE={mape:6.1f}%  -> {verdict}")

# ══════════════════════════════════════════════════════════════════════════════
# STEP 4 — Print comparison table
# ══════════════════════════════════════════════════════════════════════════════
results_df = pd.DataFrame(comparison_results).sort_values('R²', ascending=False)

print("\n" + "=" * 60)
print("  FINAL RANKING (sorted by R²)")
print("=" * 60)
print(results_df[['Model', 'MAE (units)', 'R²', 'MAPE (%)', 'Verdict']].to_string(index=False))

best = results_df.iloc[0]
print(f"\n🏆 BEST MODEL : {best['Model']}")
print(f"   R²         : {best['R²']}")
print(f"   MAE        : {best['MAE (units)']} units")
print(f"   MAPE       : {best['MAPE (%)']}%")

# ══════════════════════════════════════════════════════════════════════════════
# STEP 5 — Save results
# ══════════════════════════════════════════════════════════════════════════════
os.makedirs(REPORTS_DIR, exist_ok=True)
out_path = os.path.join(REPORTS_DIR, 'model_comparison.csv')
results_df.to_csv(out_path, index=False, encoding='utf-8-sig')
print(f"\n[+] Full comparison saved to: {out_path}")
print("\nNote: To use the best model in production, update main.py accordingly.")
