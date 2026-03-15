import matplotlib.pyplot as plt
import pandas as pd
import os


def plot_budget_distribution(category_budget_df, output_folder='outputs/charts'):
    """Generates a horizontal bar chart showing the required budget per category."""
    os.makedirs(output_folder, exist_ok=True)

    df_sorted = category_budget_df.sort_values('Budget_Required', ascending=True)

    plt.figure(figsize=(10, 6))
    plt.barh(df_sorted['Category'], df_sorted['Budget_Required'], color='#4C72B0')
    plt.xlabel('Estimated Budget Required')
    plt.title('Predicted Budget by Category for Next Month')
    plt.grid(axis='x', linestyle='--', alpha=0.7)
    plt.tight_layout()

    file_path = os.path.join(output_folder, 'category_budget_chart.png')
    plt.savefig(file_path, dpi=300)
    plt.close()
    print(f"   [+] Saved budget chart to: {file_path}")


def plot_category_trends(monthly_sales_df, output_folder='outputs/charts'):
    """Generates a line chart showing 12-month sales trends for medical categories."""
    os.makedirs(output_folder, exist_ok=True)

    trend_df = monthly_sales_df.groupby(['Month', 'Category'])['Qty'].sum().unstack().fillna(0)

    plt.figure(figsize=(12, 7))

    for category in trend_df.columns:
        if category != 'Other Meds/Unclassified':
            plt.plot(trend_df.index, trend_df[category], marker='o', linewidth=2, label=category)

    plt.xlabel('Calendar Month (1=Jan, 12=Dec)')
    plt.ylabel('Total Quantity Sold')
    plt.title('12-Month Sales Trend by Category')
    plt.xticks(range(1, 13))
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()

    file_path = os.path.join(output_folder, 'monthly_category_trends.png')
    plt.savefig(file_path, dpi=300)
    plt.close()
    print(f"   [+] Saved trend chart to: {file_path}")


# --- NEW CODE FOR RUNNING SEPARATELY ---
if __name__ == "__main__":
    print("Running Visualizations Separately...")

    # 1. Read the budget CSV that main.py created earlier
    try:
        budget_df = pd.read_csv('outputs/reports/frontend_category_budgets.csv')
        plot_budget_distribution(budget_df)
    except FileNotFoundError:
        print("[-] Error: Could not find frontend_category_budgets.csv. Run main.py first!")

    # 2. Read the 12-month preprocessed data
    try:
        preprocessed_df = pd.read_csv('data/preprocessed_12_month_data.csv')
        plot_category_trends(preprocessed_df)
    except FileNotFoundError:
        print("[-] Error: Could not find preprocessed_12_month_data.csv. Run main.py first!")

    print("Visualization process finished.")