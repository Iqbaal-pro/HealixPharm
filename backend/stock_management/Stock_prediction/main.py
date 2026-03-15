import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

# Import your custom modules from the src folder
from src.preprocessing import load_and_clean_data, get_latest_prices
from src.visualization import plot_budget_distribution, plot_category_trends


def run_prediction_pipeline():
    print("1. Loading and Preprocessing Data...")
    file_path = 'data/peoples pharmacy.xlsx'

    # Clean the data using your preprocessing.py file
    df = load_and_clean_data(file_path)

    # 🛑 CRITICAL STEP: Save the preprocessed data so visualization.py can use it later!
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/preprocessed_12_month_data.csv', index=False)
    print("   [+] Preprocessed data saved to data/preprocessed_12_month_data.csv")

    # Get latest prices for budget calculation
    latest_prices = get_latest_prices(df)

    print("2. Preparing Seasonality Data for ML...")
    # Aggregate sales per item per month
    monthly_sales = df.groupby(['Item', 'Category', 'Year', 'Month'])['Qty'].sum().reset_index()

    print("3. Training Random Forest ML Model (Predicting April)...")
    target_month = 4
    results = []
    items = monthly_sales['Item'].unique()

    for item in items:
        item_data = monthly_sales[monthly_sales['Item'] == item]

        # If item has very little data, use simple average. Otherwise, use ML.
        if len(item_data) < 3:
            predicted_qty = item_data['Qty'].mean()
        else:
            X = item_data[['Month']]
            y = item_data['Qty']

            # Random Forest captures seasonal trends
            model = RandomForestRegressor(n_estimators=50, random_state=42)
            model.fit(X, y)
            predicted_qty = model.predict(pd.DataFrame({'Month': [target_month]}))[0]

        results.append({
            'Item': item,
            'Category': item_data['Category'].iloc[0],
            'Predicted_April_Qty': max(0, round(predicted_qty))
        })

    # Add 20% safety stock buffer
    predictions_df = pd.DataFrame(results)
    predictions_df['Recommended_Stock'] = (predictions_df['Predicted_April_Qty'] * 1.2).apply(np.ceil)

    print("4. Calculating Frontend Budgets...")
    # Merge with prices and calculate total budget required
    merged = pd.merge(predictions_df, latest_prices, on='Item', how='left')
    merged['Price'] = merged['Price'].fillna(0)
    merged['Budget_Required'] = merged['Recommended_Stock'] * merged['Price']

    # Group by Category for the frontend dashboard
    category_budget = merged.groupby('Category')['Budget_Required'].sum().reset_index()
    category_budget = category_budget.sort_values(by='Budget_Required', ascending=False)
    category_budget['Budget_Required'] = category_budget['Budget_Required'].round(2)

    # 🛑 CRITICAL STEP: Save the reports so visualization.py and your frontend can read them
    os.makedirs('outputs/reports', exist_ok=True)
    category_budget.to_csv('outputs/reports/frontend_category_budgets.csv', index=False)
    category_budget.to_json('outputs/reports/frontend_category_budgets.json', orient='records')
    merged.to_csv('outputs/reports/detailed_inventory_plan.csv', index=False)
    print("   [+] Frontend reports saved to outputs/reports/")

    print("5. Generating Visualizations...")
    # Use your visualization.py file to draw the charts
    plot_budget_distribution(category_budget)
    plot_category_trends(df)

    print("\nSuccess! ML Pipeline Complete. All files and charts are ready!")


if __name__ == "__main__":
    run_prediction_pipeline()