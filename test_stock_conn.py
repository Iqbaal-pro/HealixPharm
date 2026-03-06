import mysql.connector
from mysql.connector import Error

def test_connection():
    try:
        connection = mysql.connector.connect(
            host='127.0.0.1',
            database='stock_management_db',
            user='stock_user',
            password='stock123'
        )
        if connection.is_connected():
            db_Info = connection.get_server_info()
            print("Connected to MySQL Server version ", db_Info)
            cursor = connection.cursor()
            cursor.execute("select database();")
            record = cursor.fetchone()
            print("You're connected to database: ", record)
            
            # Check for medicines table
            cursor.execute("SHOW TABLES LIKE 'medicines';")
            if cursor.fetchone():
                print("Table 'medicines' exists.")
            else:
                print("Table 'medicines' MISSING.")
                
    except Error as e:
        print("Error while connecting to MySQL", e)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")

if __name__ == "__main__":
    test_connection()
