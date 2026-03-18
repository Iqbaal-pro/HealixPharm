from app.services.s3_service import generate_presigned_url
import sys
import logging

logging.basicConfig(level=logging.INFO)

try:
    print("Testing generate_presigned_url...")
    # Generate a URL for a dummy object key
    url = generate_presigned_url("prescriptions/test-id-123.jpg")
    print(f"Generated URL successfully:\n{url}")
    
    if "amazonaws.com" in url and "X-Amz-Signature" in url:
        print("Test Passed: URL looks like a valid AWS presigned URL.")
    else:
        print("Test Failed: URL does not look like a proper AWS presigned URL.")
        sys.exit(1)
except Exception as e:
    print(f"Test Failed with exception: {e}")
    sys.exit(1)
