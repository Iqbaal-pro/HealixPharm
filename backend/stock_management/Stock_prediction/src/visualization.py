import matplotlib.pyplot as plt
import os


def plot_budget_distribution(category_budget_df, output_folder='outputs/charts'):
    """Generates a horizontal bar chart showing the required budget per category."""
    os.makedirs(output_folder, exist_ok=True)

    # Sort data so the biggest budget is at the top of the chart
    df_sorted = category_budget_df.sort_values('Budget_Required', ascending=True)

    plt.figure(figsize=(10, 6))
    plt.barh(df_sorted['Category'], df_sorted['Budget_Required'], color='#4C72B0')
    plt.xlabel('Estimated Budget Required')
    plt.title('Predicted Budget by Category for Next Month')
    plt.grid(axis='x', linestyle='--', alpha=0.7)
    plt.tight_layout()

    # Save the plot
    file_path = os.path.join(output_folder, 'category_budget_chart.png')
    plt.savefig(file_path, dpi=300)
    plt.close()  # Close memory
    print(f"   [+] Saved budget chart to: {file_path}")

.
def plot_category_trends(monthly_sales_df, output_folder='outputs/charts'):
    """Generates a line chart showing 12-month sales trends for medical categories."""
    os.makedirs(output_folder, exist_ok=True)

    # Group by Month and Category to get total quantities
    trend_df = monthly_sales_df.groupby(['Month', 'Category'])['Qty'].sum().unstack().fillna(0)

    plt.figure(figsize=(12, 7))

    # Plot each category as a line
    for category in trend_df.columns:
        # We optionally skip "Other Meds" so it doesn't squash the specific medical lines visually
        if category != 'Other Meds/Unclassified':
            plt.plot(trend_df.index, trend_df[category], marker='o', linewidth=2, label=category)

    plt.xlabel('Calendar Month (1=Jan, 12=Dec)')
    plt.ylabel('Total Quantity Sold')
    plt.title('12-Month Sales Trend by Category')
    plt.xticks(range(1, 13))  # Ensure all 12 months show on X axis
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()

    # Save the plot
    file_path = os.path.join(output_folder, 'monthly_category_trends.png')
    plt.savefig(file_path, dpi=300)
    plt.close()
    print(f"   [+] Saved trend chart to: {file_path}")