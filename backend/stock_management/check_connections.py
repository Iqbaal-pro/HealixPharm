"""
Final check: verify that the .env files resolve to Railway for all DB connections.
"""
import os
from dotenv import load_dotenv

print("=" * 60)
print("DB CONNECTION AUDIT")
print("=" * 60)

# Check stock_management
print("\n--- stock_management/db.py would use ---")
load_dotenv(r"e:\download\HealixPharm\backend\stock_management\.env", override=True)
sm_user = os.getenv("DB_USER", "stock_user")
sm_pass = os.getenv("DB_PASSWORD", "stock123")
sm_host = os.getenv("DB_HOST", "127.0.0.1")
sm_port = os.getenv("DB_PORT", "3306")
sm_name = os.getenv("DB_NAME", "stock_management_db")
sm_url = f"mysql+mysqlconnector://{sm_user}:***@{sm_host}:{sm_port}/{sm_name}"
print(f"  URL: {sm_url}")
is_railway = "rlwy.net" in sm_host
print(f"  Points to Railway: {'YES' if is_railway else 'NO -- PROBLEM!'}")

# Check healix_app
print("\n--- healix_app/config.py would use (main DB) ---")
# Clear and reload
for key in list(os.environ.keys()):
    if key.startswith("DB_") or key.startswith("STOCK_DB_") or key.startswith("USER_DB_"):
        del os.environ[key]
load_dotenv(r"e:\download\HealixPharm\backend\healix_app\.env", override=True)
ha_user = os.getenv("DB_USER", "root")
ha_pass = os.getenv("DB_PASSWORD", "")
ha_host = os.getenv("DB_HOST", "localhost")
ha_port = os.getenv("DB_PORT", "3306")
ha_name = os.getenv("DB_NAME", "healix")
ha_url = f"mysql+pymysql://{ha_user}:***@{ha_host}:{ha_port}/{ha_name}"
print(f"  URL: {ha_url}")
is_railway2 = "rlwy.net" in ha_host
print(f"  Points to Railway: {'YES' if is_railway2 else 'NO -- PROBLEM!'}")

print("\n--- healix_app/config.py would use (STOCK_DATABASE_URL) ---")
st_user = os.getenv("STOCK_DB_USER", "stock_user")
st_pass = os.getenv("STOCK_DB_PASSWORD", "stock123")
st_host = os.getenv("STOCK_DB_HOST", "127.0.0.1")
st_port = os.getenv("STOCK_DB_PORT", "3306")
st_name = os.getenv("STOCK_DB_NAME", "stock_management_db")
st_url = f"mysql+mysqlconnector://{st_user}:***@{st_host}:{st_port}/{st_name}"
print(f"  URL: {st_url}")
is_railway3 = "rlwy.net" in st_host
print(f"  Points to Railway: {'YES' if is_railway3 else 'NO -- PROBLEM!'}")

print("\n" + "=" * 60)
all_ok = is_railway and is_railway2 and is_railway3
if all_ok:
    print("ALL 3 CONNECTIONS POINT TO RAILWAY!")
else:
    problems = []
    if not is_railway: problems.append("stock_management main DB")
    if not is_railway2: problems.append("healix_app main DB")
    if not is_railway3: problems.append("healix_app STOCK_DATABASE_URL")
    print(f"PROBLEMS: {', '.join(problems)}")
print("=" * 60)
