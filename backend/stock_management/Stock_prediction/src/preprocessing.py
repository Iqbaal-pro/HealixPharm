import pandas as pd


def categorize_item(item):
    """Assigns a medical category based on the item name."""
    item = str(item).upper()
    categories = {
        'Anti-Diabetic': ['GLUCOPHAGE', 'GLYCOMET', 'DIAMICRON', 'SITA', 'EMPA', 'NEVOX', 'PROGLUTROL', 'JANUVIA',
                          'METFORMIN'],
        'Cardiovascular': ['ATORVA', 'ROSUVAS', 'LOSACAR', 'BISOPROLOL', 'CONCOR', 'CILACAR', 'LASIX', 'ECOSPRIN',
                           'ECORIN', 'ZAART', 'H.C.T', 'AMLO', 'LIPICARD', 'STATIN'],
        'Vitamins & Supplements': ['NEUROBION', 'EVION', 'VITAMIN', 'FA 1', 'FERUP', 'DEPLUS', 'VITRA', 'CALCIUM',
                                   'ZINC', 'BONE'],
        'Analgesics (Pain/Fever)': ['PANADOL', 'PANADEINE', 'RAPIDINE', 'FASTUM', 'PARACETAMOL', 'DICLOFENAC',
                                    'IBUPROFEN', 'SOLPADINE'],
        'Gastrointestinal': ['OMEPRAZOLE', 'VOMIKIND', 'JEEVANEE', 'CLASIPRO', 'LANZOPRAZOLE', 'PANTOPRAZOLE',
                             'GAVISCON', 'ENO'],
        'Consumer Goods & Skincare': ['BISCUITS', 'SHAMPOO', 'SOAP', 'ACNE AID', 'MICROPORE', 'PERNEX', 'LOTION',
                                      'WASH', 'TAPE', 'CREAM'],
        'Respiratory & Antibiotics': ['CLOXIL', 'AXCIL', 'DOXYN', 'TRIFIX', 'AMOXICILLIN', 'AZITHROMYCIN', 'AUGMENTIN',
                                      'CLARYTIN', 'SALBUTAMOL', 'INHALER']
    }
    for category, keywords in categories.items():
        if any(keyword in item for keyword in keywords):
            return category
    return 'Other Meds/Unclassified'


def load_and_clean_data(file_path):
    """
    Loads the raw pharmacy CSV, fills missing dates, removes invalid items,
    applies categories, and extracts seasonality features.
    """
    print("-> Loading raw data...")
    df = pd.read_csv(file_path, skiprows=4)
    df.columns = ['Date', 'VchNo', 'Particulars', 'Item', 'Qty', 'Unit', 'Price', 'Amount']

    print("-> Fixing dates and formatting...")
    # Forward-fill missing dates from the bill headers
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce').ffill()
    df['Item'] = df['Item'].astype(str).str.strip()

    # Remove non-inventory items
    df = df[df['Item'] != 'DELIVERY CHARGE']

    print("-> Applying medical categories...")
    df['Category'] = df['Item'].apply(categorize_item)

    print("-> Extracting seasonality (Month/Year)...")
    df['Month'] = df['Date'].dt.month
    df['Year'] = df['Date'].dt.year

    return df


def get_latest_prices(df):
    """Extracts the most recent price for every item to use in budget calculations."""
    return df.groupby('Item')['Price'].last().reset_index()