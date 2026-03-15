import os
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Import custom modules from the src folder
from src.preprocessing import load_and_clean_data, get_latest_prices
from src.visualization import plot_budget_distribution, plot_category_trends


def run_prediction_pipeline():
    # Base directory = folder where main.py lives
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    # --- Dynamically determine the next month to predict ---
    today = datetime.today()
    if today.month == 12:
        target_month = 1
        target_year = today.year + 1
    else:
        target_month = today.month + 1
        target_year = today.year
    month_name = datetime(target_year, target_month, 1).strftime('%B %Y')
    print(f"=== Predicting stock for: {month_name} ===\n")

    # -------------------------------------------------------
    print("1. Loading and Preprocessing Data...")
    file_path = os.path.join(BASE_DIR, 'data', 'peoples pharmacy.xlsx')
    df = load_and_clean_data(file_path)

    # Save preprocessed data for visualization.py to use
    data_dir = os.path.join(BASE_DIR, 'data')
    os.makedirs(data_dir, exist_ok=True)
    output_csv = os.path.join(data_dir, 'preprocessed_12_month_data.csv')
    df.to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"   [+] Preprocessed data saved to {output_csv}")

    # Get latest prices for budget calculation
    latest_prices = get_latest_prices(df)

    # -------------------------------------------------------
    print("\n2. Preparing Monthly Sales Aggregation...")
    monthly_sales = df.groupby(['Item', 'Category', 'Year', 'Month'])['Qty'].sum().reset_index()
    print(f"   [+] Total item-month records: {len(monthly_sales)}")

    # -------------------------------------------------------
    print(f"\n3. Training Random Forest ML Model (Predicting {month_name})...")
    results = []
    items = monthly_sales['Item'].unique()
    low_data_count = 0
    ml_count = 0

    # --- Collect predictions vs actuals for evaluation ---
    all_y_true = []
    all_y_pred = []

    for item in items:
        item_data = monthly_sales[monthly_sales['Item'] == item].copy()
        if item_data.empty:
            continue

        category = item_data['Category'].iloc[0]

        if len(item_data) < 3:
            # Not enough data for ML — use average
            predicted_qty = item_data['Qty'].mean()
            low_data_count += 1
        else:
            X = item_data[['Month']]
            y = item_data['Qty']

            # --- Train/Test Split: hold out last month for evaluation ---
            X_train, X_test = X.iloc[:-1], X.iloc[-1:]
            y_train, y_test = y.iloc[:-1], y.iloc[-1:]

            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)

            # Evaluate on held-out last month
            y_pred_eval = model.predict(X_test)[0]
            all_y_true.append(y_test.values[0])
            all_y_pred.append(max(0, y_pred_eval))

            # Retrain on ALL data, then predict target month
            model.fit(X, y)
            predicted_qty = model.predict(pd.DataFrame({'Month': [target_month]}))[0]
            ml_count += 1

        results.append({
            'Item': item,
            'Category': category,
            f'Predicted_{month_name.replace(" ", "_")}_Qty': max(0, round(predicted_qty))
        })

    print(f"   [+] ML model used for {ml_count} items, average used for {low_data_count} items")

    # --- Print Evaluation Metrics ---
    if all_y_true:
        mae  = mean_absolute_error(all_y_true, all_y_pred)
        rmse = np.sqrt(mean_squared_error(all_y_true, all_y_pred))
        r2   = r2_score(all_y_true, all_y_pred)

        # MAPE — skip items where actual is 0 to avoid division by zero
        mape_vals = [
            abs((t - p) / t) * 100
            for t, p in zip(all_y_true, all_y_pred) if t != 0
        ]
        mape = np.mean(mape_vals)

        print(f"\n   📊 MODEL EVALUATION (held-out last month per item):")
        print(f"   ├── MAE   : {mae:.2f} units   (avg prediction error)")
        print(f"   ├── RMSE  : {rmse:.2f} units  (penalizes large errors)")
        print(f"   ├── R²    : {r2:.4f}         (1.0 = perfect, >0.75 = good)")
        print(f"   └── MAPE  : {mape:.2f}%        (% error on average)")

        # --- Interpretation ---
        print(f"\n   📝 Interpretation:")
        if r2 >= 0.85:
            verdict = "Excellent ✅"
        elif r2 >= 0.70:
            verdict = "Good ✅"
        elif r2 >= 0.50:
            verdict = "Acceptable ⚠️"
        else:
            verdict = "Needs Improvement ❌"
        print(f"   └── R² = {r2:.4f} → {verdict}")
        print(f"   └── On average, predictions are off by {mae:.1f} units per item")

        # --- Save evaluation metrics to file ---
        eval_data = {
            'Metric': ['MAE', 'RMSE', 'R2_Score', 'MAPE (%)'],
            'Value': [round(mae, 4), round(rmse, 4), round(r2, 4), round(mape, 4)],
            'Interpretation': [
                f'Avg error of {mae:.1f} units per item',
                f'Large-error-penalized score: {rmse:.1f}',
                verdict,
                f'Avg {mape:.1f}% off from actual quantity'
            ]
        }
        eval_df = pd.DataFrame(eval_data)
        reports_dir_eval = os.path.join(BASE_DIR, 'outputs', 'reports')
        os.makedirs(reports_dir_eval, exist_ok=True)
        eval_df.to_csv(os.path.join(reports_dir_eval, 'model_evaluation.csv'), index=False, encoding='utf-8-sig')
        print(f"\n   [+] Evaluation saved to outputs/reports/model_evaluation.csv")

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

    # Category-level budget summary
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
