import pandas as pd


def categorize_item(item):
    """Assigns a medical category based on the item name."""
    item = str(item).upper()
    categories = {
        'Anti-Diabetic': ['GLUCOPHAGE', 'GLYCOMET', 'DIAMICRON', 'SITA', 'EMPA', 'NEVOX', 'PROGLUTROL', 'JANUVIA',
                          'METFORMIN', 'RECLIDE', 'EMPAVIC', 'DIPLIN', 'LANTUS', 'GLICLAZIDE', 'GLIPIZIDE'],
        'Cardiovascular': ['ATORVA', 'ROSUVAS', 'LOSACAR', 'BISOPROLOL', 'CONCOR', 'CILACAR', 'LASIX', 'ECOSPRIN',
                           'ECORIN', 'ZAART', 'H.C.T', 'AMLO', 'LIPICARD', 'STATIN', 'BISOLOL', 'AMLODIPINE',
                           'TELMISARTAN', 'RAMIPRIL', 'CARVEDILOL', 'NEBIVOLOL'],
        'Vitamins & Supplements': ['NEUROBION', 'EVION', 'VITAMIN', 'FA 1', 'FERUP', 'DEPLUS', 'VITRA', 'CALCIUM',
                                   'ZINC', 'BONE', 'FOLIC', 'IRON', 'MULTIVIT'],
        'Analgesics (Pain/Fever)': ['PANADOL', 'PANADEINE', 'RAPIDINE', 'FASTUM', 'PARACETAMOL', 'DICLOFENAC',
                                    'IBUPROFEN', 'SOLPADINE', 'ARCOXIA', 'CELEBREX', 'TRAMADOL', 'KETOROLAC'],
        'Gastrointestinal': ['OMEPRAZOLE', 'VOMIKIND', 'JEEVANEE', 'CLASIPRO', 'LANZOPRAZOLE', 'PANTOPRAZOLE',
                             'GAVISCON', 'ENO', 'NEXIUM', 'RANITIDINE', 'DOMPERIDONE', 'METOCLOPRAMIDE'],
        'Consumer Goods & Skincare': ['BISCUITS', 'SHAMPOO', 'SOAP', 'ACNE AID', 'MICROPORE', 'PERNEX', 'LOTION',
                                      'WASH', 'TAPE', 'CREAM', 'GEL', 'POWDER', 'BANDAGE', 'PLASTER'],
        'Respiratory & Antibiotics': ['CLOXIL', 'AXCIL', 'DOXYN', 'TRIFIX', 'AMOXICILLIN', 'AZITHROMYCIN',
                                      'AUGMENTIN', 'CLARYTIN', 'SALBUTAMOL', 'INHALER', 'CEFUROXIME', 'CIPROFLOX',
                                      'CLAVULANATE', 'COTRIMOXAZOLE', 'DOXYCYCLINE', 'CLARITHROMYCIN', 'CETIRIZINE',
                                      'LORATADINE', 'MONTELUKAST', 'SERETIDE', 'VENTOLIN']
    }
    for category, keywords in categories.items():
        if any(keyword in item for keyword in keywords):
            return category
    return 'Other Meds/Unclassified'


def load_and_clean_data(file_path):
    """
    Loads the raw pharmacy Excel file.
    - Skips the 4 title rows at the top (header is on row index 4)
    - Uses correct column names: 'Item Details', 'Qty.'
    - Forward-fills dates from bill headers
    - Removes invalid rows
    - Applies medical categories
    - Extracts Month/Year for seasonality
    """
    print("-> Loading raw data...")
    # FIX 1: Skip the 4 header/title rows — real column headers are on row 4
    df = pd.read_excel(file_path, sheet_name='Sheet1', header=4)

    print("-> Fixing column names...")
    # FIX 2: Rename to standard internal names
    df = df.rename(columns={
        'Item Details': 'Item',
        'Qty.': 'Qty',
        'Vch/Bill No': 'VchNo',
        'Particulars': 'Particulars'
    })

    print("-> Fixing dates and formatting...")
    # FIX 3: Forward-fill dates (only bill header rows have dates)
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce').ffill()

    # Drop rows where Item is missing or NaN
    df = df[df['Item'].notna()]
    df['Item'] = df['Item'].astype(str).str.strip()

    # Remove non-inventory rows
    df = df[df['Item'] != 'DELIVERY CHARGE']
    df = df[df['Item'] != 'nan']
    df = df[df['Item'].str.len() > 1]

    print("-> Forcing Qty and Price to numeric...")
    df['Qty'] = pd.to_numeric(
        df['Qty'].astype(str).str.replace(',', '').str.strip(), errors='coerce'
    ).fillna(0)
    df['Price'] = pd.to_numeric(
        df['Price'].astype(str).str.replace(',', '').str.strip(), errors='coerce'
    ).fillna(0)

    # Drop rows with zero or negative quantity
    df = df[df['Qty'] > 0]

    print("-> Applying medical categories...")
    df['Category'] = df['Item'].apply(categorize_item)

    print("-> Extracting seasonality (Month/Year)...")
    df['Month'] = df['Date'].dt.month
    df['Year'] = df['Date'].dt.year

    print(f"   [+] Clean data shape: {df.shape}")
    print(f"   [+] Date range: {df['Date'].min().date()} → {df['Date'].max().date()}")
    print(f"   [+] Unique items: {df['Item'].nunique()}")
    print(f"   [+] Unique months: {sorted(df['Month'].unique())}")

    return df


def get_latest_prices(df):
    """Extracts the most recent unit price for every item."""
    return df.groupby('Item')['Price'].last().reset_index()
