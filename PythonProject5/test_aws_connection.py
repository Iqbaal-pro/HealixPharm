"""
test_aws_connection.py
───────────────────────
Validates that the AWS S3 credentials in .env are correct and that
the application can successfully upload and presign files.

Usage:
    python test_aws_connection.py
"""
import sys
import os
import logging

# Ensure the app directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.s3_service import upload_prescription, generate_presigned_url
from app.core.config import settings

# Configure logging to see output in terminal
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')

def test_s3():
    print("=== HealixPharm AWS S3 Connection Test ===\n")
    print(f"Bucket: {settings.AWS_S3_BUCKET}")
    print(f"Region: {settings.AWS_REGION}")
    print(f"Access Key: {settings.AWS_ACCESS_KEY_ID[:5]}...{settings.AWS_ACCESS_KEY_ID[-4:]}")
    print("-" * 40)

    test_data = b"HealixPharm S3 Connection Test - " + __import__("datetime").datetime.now().isoformat().encode()
    test_id = "test_connection_" + __import__("uuid").uuid4().hex[:8]

    try:
        print(f"\n1. Attempting to upload test file...")
        s3_key = upload_prescription(test_id, test_data)
        print(f"✅ Upload Successful! Key: {s3_key}")

        print(f"\n2. Attempting to generate presigned URL...")
        url = generate_presigned_url(s3_key)
        print(f"✅ URL Generated: {url[:60]}...")
        
        print(f"\n3. Verification Complete.")
        print("\nSUCCESS: AWS S3 integration is working correctly.")
        
    except Exception as e:
        print(f"\n❌ FAILED: S3 Operation error: {e}")
        print("\nPlease check:")
        print("  - Are the credentials in .env correct?")
        print("  - Does the bucket 'healix-pharm-prescriptions' exist?")
        print("  - Does the IAM user have 's3:PutObject' and 's3:GetObject' permissions?")

if __name__ == "__main__":
    test_s3()
