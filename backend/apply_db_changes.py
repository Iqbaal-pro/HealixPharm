import sys
try:
    from sqlalchemy import create_engine, text
except ImportError:
    print("SQLAlchemy not installed")
    sys.exit(1)

DB_URL = "mysql+pymysql://root:RlnRjwychOZnxtmmsQijKtvjmuadwelv@ballast.proxy.rlwy.net:33283/railway"
engine = create_engine(DB_URL)

sql_commands = [
    """
    ALTER TABLE prescriptions
    ADD COLUMN medicine_name VARCHAR(100),
    ADD COLUMN dose_quantity INT DEFAULT 0,
    ADD COLUMN interval_hours INT DEFAULT 0,
    ADD COLUMN meal_timing VARCHAR(100),
    ADD COLUMN start_time DATETIME,
    ADD COLUMN prescription_id VARCHAR(128),
    ADD COLUMN order_id INT,
    ADD COLUMN s3_key VARCHAR(512),
    ADD COLUMN s3_url TEXT,
    ADD COLUMN notes TEXT;
    """,
    """
    ALTER TABLE users
    ADD COLUMN phone VARCHAR(64),
    ADD COLUMN name VARCHAR(255);
    """,
    """
    ALTER TABLE users ADD UNIQUE (phone);
    """
]

with engine.connect() as conn:
    for cmd in sql_commands:
        try:
            print(f"Executing: {cmd.strip()[:50]}...")
            conn.execute(text(cmd))
            conn.commit()
            print("Success.")
        except Exception as e:
            print(f"Error: {e}")
