"""
Standalone test execution script for CareerSphere Backend
Runs all automated unit, security, health, and data isolation tests.
"""

import os
import sys
import time

os.environ["TESTING"] = "1"
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Ensure root directory is on Python path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi.testclient import TestClient
from backend.server import app
from backend.database import Database
import tests.test_backend as tb

def main():
    print("=" * 65)
    print(" CareerSphere Automated Production Test Suite")
    print("=" * 65)
    Database.init_db()

    client = TestClient(app)

    test_functions = [
        ("Health Check Endpoint", tb.test_health_check),
        ("Candidate Registration (Valid)", tb.test_user_registration_success),
        ("Candidate Duplicate Registration Rejection (409)", tb.test_user_registration_duplicate_rejection),
        ("Candidate Invalid Email Format Rejection (400)", tb.test_user_registration_invalid_email),
        ("Candidate Weak Password Rejection (400)", tb.test_user_registration_weak_password),
        ("Candidate Login with Correct Credentials (200 + JWT)", tb.test_login_success),
        ("Candidate Login with Invalid Credentials (401)", tb.test_login_invalid_credentials),
        ("Protected Routes Authentication Enforcement (401)", tb.test_protected_routes_require_token),
        ("User Profile Fetch with Bearer Token (200)", tb.test_get_current_user_profile),
        ("User Profile Update & Persistence (200)", tb.test_update_user_profile),
        ("Multi-User Tenant Data Isolation (Strict Privacy)", tb.test_multi_user_data_isolation),
        ("Corporate Tech Jobs Public Endpoint (200)", tb.test_public_corporate_jobs_endpoint),
        ("Government Recruitment Public Endpoint (200)", tb.test_public_government_jobs_endpoint),
        ("Student Internships Public Endpoint (200)", tb.test_public_internships_endpoint),
        ("Intelligent Eligibility Matching Engine (200)", tb.test_eligibility_matching_endpoint),
    ]

    passed = 0
    failed = 0
    t0 = time.time()

    for name, func in test_functions:
        test_start = time.time()
        try:
            func(client)
            elapsed = time.time() - test_start
            print(f"  ✓ PASS: {name:<50} ({elapsed:.3f}s)")
            passed += 1
        except Exception as e:
            elapsed = time.time() - test_start
            print(f"  ✗ FAIL: {name:<50} ({elapsed:.3f}s)")
            print(f"    Error: {e}")
            failed += 1

    total_time = time.time() - t0
    print("-" * 65)
    print(f" Results: {passed} passed, {failed} failed in {total_time:.2f}s")
    print("=" * 65)

    if failed > 0:
        sys.exit(1)

if __name__ == '__main__':
    main()
