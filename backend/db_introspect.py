import sys
try:
    from sqlalchemy import create_engine, MetaData
except ImportError:
    print("SQLAlchemy not installed")
    sys.exit(1)

DB_URL = "mysql+pymysql://root:RlnRjwychOZnxtmmsQijKtvjmuadwelv@ballast.proxy.rlwy.net:33283/railway"
engine = create_engine(DB_URL)
metadata = MetaData()
metadata.reflect(bind=engine)

for table_name, table in metadata.tables.items():
    print(f"TABLE: {table_name}")
    for column in table.columns:
        print(f"  COLUMN: {column.name} | {column.type} | PK={column.primary_key} | Null_Ok={column.nullable}")
