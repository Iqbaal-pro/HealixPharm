import os
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.preprocessing import load_and_clean_data, get_latest_prices
from src.visualization import plot_budget_distribution, plot_category_trends


def run_prediction_pipeline():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    today = datetime.today()
    if today.month == 12:
        target_month, target_year = 1, today.year + 1
    else:
        target_month, target_year = today.month + 1, today.year
    month_name = datetime(target_year, target_month, 1).strftime('%B %Y')
    print(f"=== Predicting stock for: {month_name} ===\n")

    # -------------------------------------------------------
    print("1. Loading and Preprocessing Data...")
    file_path = os.path.join(BASE_DIR, 'data', 'peoples pharmacy.xlsx')
    df = load_and_clean_data(file_path)

    data_dir = os.path.join(BASE_DIR, 'data')
    os.makedirs(data_dir, exist_ok=True)
    output_csv = os.path.join(data_dir, 'preprocessed_12_month_data.csv')
    df.to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"   [+] Preprocessed data saved to {output_csv}")

    latest_prices = get_latest_prices(df)

    # -------------------------------------------------------
    print("\n2. Preparing Monthly Sales Aggregation...")
    monthly_sales = df.groupby(['Item', 'Category', 'Month'])['Qty'].sum().reset_index()
    monthly_sales = monthly_sales.sort_values(['Item', 'Month']).reset_index(drop=True)
    print(f"   [+] Total item-month records: {len(monthly_sales)}")

    # -------------------------------------------------------
    print(f"\n3. Predicting {month_name} using best strategy per item...")

    results = []
    eval_records = []  # for evaluation

    # Segment items by how many months of data they have
    item_month_counts = monthly_sales.groupby('Item')['Month'].count()
    items_12 = item_month_counts[item_month_counts == 12].index   # full year
    items_6  = item_month_counts[(item_month_counts >= 6) & (item_month_counts < 12)].index
    items_3  = item_month_counts[(item_month_counts >= 3) & (item_month_counts < 6)].index
    items_low = item_month_counts[item_month_counts < 3].index

    print(f"   [+] Items with 12 months (Random Forest): {len(items_12)}")
    print(f"   [+] Items with 6-11 months (Weighted Avg): {len(items_6)}")
    print(f"   [+] Items with 3-5 months  (Weighted Avg): {len(items_3)}")
    print(f"   [+] Items with <3 months   (Simple Avg)  : {len(items_low)}")

    for item in monthly_sales['Item'].unique():
        item_data = monthly_sales[monthly_sales['Item'] == item].copy().reset_index(drop=True)
        category  = item_data['Category'].iloc[0]
        n_months  = len(item_data)

        # --- STRATEGY 1: Full 12-month → Random Forest with same-month last year ---
        if item in items_12:
            X = item_data[['Month']]
            y = item_data['Qty']

            # Evaluation: predict last known month, train on rest
            X_train, X_test = X.iloc[:-1], X.iloc[[-1]]
            y_train, y_test = y.iloc[:-1], y.iloc[-1]
            model_eval = RandomForestRegressor(n_estimators=100, random_state=42)
            model_eval.fit(X_train, y_train)
            y_pred_eval = max(0, model_eval.predict(X_test)[0])
            eval_records.append({'true': y_test, 'pred': y_pred_eval, 'group': '12-month RF'})

            # Final prediction: train on all 12 months
            model_final = RandomForestRegressor(n_estimators=100, random_state=42)
            model_final.fit(X, y)
            predicted_qty = model_final.predict(pd.DataFrame({'Month': [target_month]}))[0]

        # --- STRATEGY 2: 6-11 months → Weighted average (recent months count more) ---
        elif item in items_6:
            # Check if we have data for the target month from last year
            same_month = item_data[item_data['Month'] == target_month]
            if not same_month.empty:
                # Weight: 60% same month last year + 40% recent 3-month avg
                same_month_qty = same_month['Qty'].values[0]
                recent_avg = item_data.tail(3)['Qty'].mean()
                predicted_qty = 0.6 * same_month_qty + 0.4 * recent_avg
            else:
                # Weighted average giving more weight to recent months
                weights = np.arange(1, n_months + 1)
                predicted_qty = np.average(item_data['Qty'].values, weights=weights)

            # Evaluation
            y_test = item_data['Qty'].iloc[-1]
            y_pred_eval = item_data['Qty'].iloc[:-1].mean()
            eval_records.append({'true': y_test, 'pred': y_pred_eval, 'group': '6-11 month WA'})

        # --- STRATEGY 3: 3-5 months → Weighted average ---
        elif item in items_3:
            weights = np.arange(1, n_months + 1)
            predicted_qty = np.average(item_data['Qty'].values, weights=weights)

            y_test = item_data['Qty'].iloc[-1]
            y_pred_eval = item_data['Qty'].iloc[:-1].mean()
            eval_records.append({'true': y_test, 'pred': y_pred_eval, 'group': '3-5 month WA'})

        # --- STRATEGY 4: <3 months → Simple average ---
        else:
            predicted_qty = item_data['Qty'].mean()

        results.append({
            'Item': item,
            'Category': category,
            f'Predicted_{month_name.replace(" ", "_")}_Qty': max(0, round(predicted_qty))
        })

    # -------------------------------------------------------
    # Evaluation — split by group
    eval_df_raw = pd.DataFrame(eval_records)
    y_true_all = eval_df_raw['true'].values
    y_pred_all = eval_df_raw['pred'].values

    mae  = mean_absolute_error(y_true_all, y_pred_all)
    rmse = np.sqrt(mean_squared_error(y_true_all, y_pred_all))
    r2   = r2_score(y_true_all, y_pred_all)
    mape_vals = [abs((t-p)/t)*100 for t,p in zip(y_true_all, y_pred_all) if t != 0]
    mape = np.mean(mape_vals)

    if r2 >= 0.85:   verdict = "Excellent ✅"
    elif r2 >= 0.70: verdict = "Good ✅"
    elif r2 >= 0.50: verdict = "Acceptable ⚠️"
    else:            verdict = "Needs Improvement ❌"

    print(f"\n   📊 OVERALL MODEL EVALUATION:")
    print(f"   ├── MAE   : {mae:.2f} units")
    print(f"   ├── RMSE  : {rmse:.2f} units")
    print(f"   ├── R²    : {r2:.4f}  → {verdict}")
    print(f"   └── MAPE  : {mape:.2f}%")

    # Per-group breakdown
    print(f"\n   📊 EVALUATION BY STRATEGY:")
    for group in eval_df_raw['group'].unique():
        g = eval_df_raw[eval_df_raw['group'] == group]
        g_mae  = mean_absolute_error(g['true'], g['pred'])
        g_r2   = r2_score(g['true'], g['pred'])
        g_mape = np.mean([abs((t-p)/t)*100 for t,p in zip(g['true'],g['pred']) if t!=0])
        print(f"   ├── {group:20s} → MAE: {g_mae:7.1f}  R²: {g_r2:.4f}  MAPE: {g_mape:.1f}%")

    # Save evaluation
    eval_out = pd.DataFrame({
        'Metric':         ['MAE', 'RMSE', 'R2_Score', 'MAPE (%)'],
        'Value':          [round(mae,4), round(rmse,4), round(r2,4), round(mape,4)],
        'Interpretation': [
            f'Avg error of {mae:.1f} units per item',
            f'Large-error-penalized: {rmse:.1f}',
            verdict,
            f'Avg {mape:.1f}% off from actual'
        ]
    })

    # -------------------------------------------------------
    print("\n4. Applying 20% Safety Stock Buffer...")
    pred_col = f'Predicted_{month_name.replace(" ", "_")}_Qty'
    predictions_df = pd.DataFrame(results)
    predictions_df['Recommended_Stock'] = (predictions_df[pred_col] * 1.2).apply(np.ceil).astype(int)

    # -------------------------------------------------------
    print("\n5. Calculating Budget Requirements...")
    merged = pd.merge(predictions_df, latest_prices, on='Item', how='left')
    merged['Price'] = merged['Price'].fillna(0)
    merged['Budget_Required'] = merged['Recommended_Stock'] * merged['Price']

    category_budget = merged.groupby('Category')['Budget_Required'].sum().reset_index()
    category_budget = category_budget.sort_values(by='Budget_Required', ascending=False)
    category_budget['Budget_Required'] = category_budget['Budget_Required'].round(2)
    total_budget = category_budget['Budget_Required'].sum()
    print(f"   [+] Total estimated budget: Rs. {total_budget:,.2f}")

    # -------------------------------------------------------
    print("\n6. Saving Reports...")
    reports_dir = os.path.join(BASE_DIR, 'outputs', 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    category_budget.to_csv(os.path.join(reports_dir, 'frontend_category_budgets.csv'), index=False, encoding='utf-8-sig')
    category_budget.to_json(os.path.join(reports_dir, 'frontend_category_budgets.json'), orient='records')
    merged.to_csv(os.path.join(reports_dir, 'detailed_inventory_plan.csv'), index=False, encoding='utf-8-sig')
    eval_out.to_csv(os.path.join(reports_dir, 'model_evaluation.csv'), index=False, encoding='utf-8-sig')
    print(f"   [+] Reports saved to {reports_dir}")

    # -------------------------------------------------------
    print("\n7. Generating Visualizations...")
    charts_dir = os.path.join(BASE_DIR, 'outputs', 'charts')
    plot_budget_distribution(category_budget, output_folder=charts_dir)
    plot_category_trends(df, output_folder=charts_dir)

    # -------------------------------------------------------
    print(f"\n{'='*50}")
    print(f"✅ ML Pipeline Complete!")
    print(f"   Target month   : {month_name}")
    print(f"   Items predicted: {len(predictions_df)}")
    print(f"   Total budget   : Rs. {total_budget:,.2f}")
    print(f"{'='*50}")


if __name__ == "__main__":
    run_prediction_pipeline()
