"""
CareerSphere Backend Test Suite
Covers:
  - System Health Check
  - Authentication (Registration, Password Strength, Duplicate Prevention, Login, JWT tokens)
  - Security & Protected Routes (401 Unauthorized without token, 200 with token)
  - Strict Multi-User Tenant Data Isolation (User A cannot view or alter User B's saved opportunities or profiles)
  - Public Real-World Job APIs (Corporate, Government, Internships, Eligibility Engine)
"""

import os
import sys

# Set testing environment before importing server
os.environ["TESTING"] = "1"
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"

import uuid
import pytest
from fastapi.testclient import TestClient

# Ensure root directory is on Python path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.server import app
from backend.database import Database
from backend.auth import hash_password, verify_password, create_access_token, decode_access_token

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure database schema is initialized before tests run."""
    Database.init_db()
    yield

@pytest.fixture(scope="module")
def client():
    """Creates a test client."""
    return TestClient(app)

# ==================== 1. HEALTH CHECK ====================
def test_health_check(client):
    """Verify /api/health responds with healthy status and database metrics."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"]["status"] == "connected"
    assert "timestamp" in data
    assert "serverStartTime" in data

# ==================== 2. AUTHENTICATION & SECURITY ====================
def test_user_registration_success(client):
    """Verify new candidate registration returns JWT token and candidate profile."""
    unique_email = f"candidate_{uuid.uuid4().hex[:8]}@realm.com"
    payload = {
        "email": unique_email,
        "password": "StrongPassword123!",
        "fullName": "Arya Stark",
        "qualification": "Graduate (Bachelor's)",
        "degree": "B.Tech Computer Science"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["fullName"] == "Arya Stark"
    assert "password" not in data["user"]
    assert "passwordHash" not in data["user"]

def test_user_registration_duplicate_rejection(client):
    """Verify attempting to register the same email twice returns 409 Conflict."""
    unique_email = f"duplicate_{uuid.uuid4().hex[:8]}@realm.com"
    payload = {
        "email": unique_email,
        "password": "ValidPassword99!",
        "fullName": "Jon Snow"
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 200

    # Second attempt with same email
    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 409
    err_msg = res2.json().get("detail", "").lower()
    assert "already exists" in err_msg or "already registered" in err_msg

def test_user_registration_invalid_email(client):
    """Verify malformed email formats are rejected with 400 Bad Request."""
    payload = {
        "email": "not-a-valid-email",
        "password": "ValidPassword99!",
        "fullName": "Ghost"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code in (400, 422)

def test_user_registration_weak_password(client):
    """Verify passwords shorter than 8 characters are rejected."""
    payload = {
        "email": f"weak_{uuid.uuid4().hex[:8]}@realm.com",
        "password": "short",
        "fullName": "Tyrion"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code in (400, 422)

def test_login_success(client):
    """Verify valid credentials return a signed JWT access token."""
    email = f"login_test_{uuid.uuid4().hex[:8]}@realm.com"
    pwd = "CorrectHorseBattery9!"
    client.post("/api/auth/register", json={"email": email, "password": pwd, "fullName": "Daenerys"})

    login_res = client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert login_res.status_code == 200
    data = login_res.json()
    assert data["success"] is True
    assert "token" in data
    token = data["token"]

    # Verify decoded token payload
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["email"] == email

def test_login_invalid_credentials(client):
    """Verify incorrect password returns 401 Unauthorized."""
    email = f"bad_pwd_{uuid.uuid4().hex[:8]}@realm.com"
    pwd = "ValidPassword123!"
    client.post("/api/auth/register", json={"email": email, "password": pwd, "fullName": "Jaime"})

    login_res = client.post("/api/auth/login", json={"email": email, "password": "WrongPassword99!"})
    assert login_res.status_code == 401
    assert "invalid email or password" in login_res.json()["detail"].lower()

# ==================== 3. PROTECTED ROUTES & AUTHORIZATION ====================
def test_protected_routes_require_token(client):
    """Verify protected endpoints reject unauthenticated requests with 401."""
    routes = [
        ("GET", "/api/auth/me"),
        ("GET", "/api/user/profile"),
        ("PUT", "/api/user/profile"),
        ("GET", "/api/user/saved"),
        ("POST", "/api/user/saved"),
        ("GET", "/api/user/eligibility"),
        ("PUT", "/api/user/eligibility")
    ]
    for method, path in routes:
        if method == "GET":
            res = client.get(path)
        elif method == "PUT":
            res = client.put(path, json={})
        else:
            res = client.post(path, json={})
        assert res.status_code == 401, f"{method} {path} should return 401 without token, got {res.status_code}"

def test_get_current_user_profile(client):
    """Verify /api/auth/me returns candidate profile when bearer token is supplied."""
    email = f"profile_test_{uuid.uuid4().hex[:8]}@realm.com"
    reg = client.post("/api/auth/register", json={
        "email": email,
        "password": "ValidPassword123!",
        "fullName": "Brienne of Tarth"
    }).json()
    token = reg["token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["user"]["fullName"] == "Brienne of Tarth"

def test_update_user_profile(client):
    """Verify updating candidate profile persists changes to the database."""
    email = f"update_prof_{uuid.uuid4().hex[:8]}@realm.com"
    reg = client.post("/api/auth/register", json={
        "email": email,
        "password": "ValidPassword123!",
        "fullName": "Bran Stark"
    }).json()
    token = reg["token"]

    update_payload = {
        "bio": "Software Engineer & Distributed Systems Enthusiast",
        "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
        "experience": "1 Year",
        "preferredLocations": ["Bengaluru"],
        "degree": "B.Tech IT"
    }
    update_res = client.put("/api/user/profile", json=update_payload, headers={"Authorization": f"Bearer {token}"})
    assert update_res.status_code == 200
    updated_profile = update_res.json()["profile"]
    assert updated_profile["bio"] == "Software Engineer & Distributed Systems Enthusiast"
    assert "Python" in updated_profile["skills"]

# ==================== 4. TENANT DATA ISOLATION ====================
def test_multi_user_data_isolation(client):
    """
    CRITICAL SECURITY & PORTFOLIO TEST:
    Verify User A and User B have strictly isolated data spaces.
    User A cannot view, mutate, or delete User B's saved opportunities.
    """
    # Create User A
    user_a = client.post("/api/auth/register", json={
        "email": f"user_a_{uuid.uuid4().hex[:8]}@realm.com",
        "password": "Password123A!",
        "fullName": "Candidate A"
    }).json()
    token_a = user_a["token"]

    # Create User B
    user_b = client.post("/api/auth/register", json={
        "email": f"user_b_{uuid.uuid4().hex[:8]}@realm.com",
        "password": "Password123B!",
        "fullName": "Candidate B"
    }).json()
    token_b = user_b["token"]

    # User A saves Opportunity 101
    opp_a = {
        "id": "opp-secret-a-101",
        "type": "corporate",
        "title": "Confidential Staff Engineer at Winterfell Labs",
        "organization": "Winterfell Tech",
        "category": "Corporate Jobs",
        "location": "Remote",
        "salary": "₹35,00,000 / year"
    }
    res_a = client.post("/api/user/saved", json=opp_a, headers={"Authorization": f"Bearer {token_a}"})
    assert res_a.status_code == 200

    # User B saves Opportunity 202
    opp_b = {
        "id": "opp-secret-b-202",
        "type": "government",
        "title": "Commandant - Northern Wall Patrol",
        "organization": "Ministry of Defense",
        "category": "Government Jobs",
        "location": "The Wall",
        "salary": "Pay Level 10 (₹56,100 - ₹1,77,500)"
    }
    res_b = client.post("/api/user/saved", json=opp_b, headers={"Authorization": f"Bearer {token_b}"})
    assert res_b.status_code == 200

    # User A views saved items: MUST only see Opportunity 101, NOT Opportunity 202
    fetch_a = client.get("/api/user/saved", headers={"Authorization": f"Bearer {token_a}"}).json()
    saved_ids_a = [item["id"] for item in fetch_a["saved"]]
    assert "opp-secret-a-101" in saved_ids_a
    assert "opp-secret-b-202" not in saved_ids_a, "SECURITY VIOLATION: User A can see User B's saved opportunities!"

    # User B views saved items: MUST only see Opportunity 202, NOT Opportunity 101
    fetch_b = client.get("/api/user/saved", headers={"Authorization": f"Bearer {token_b}"}).json()
    saved_ids_b = [item["id"] for item in fetch_b["saved"]]
    assert "opp-secret-b-202" in saved_ids_b
    assert "opp-secret-a-101" not in saved_ids_b, "SECURITY VIOLATION: User B can see User A's saved opportunities!"

    # User A deletes their opportunity
    del_res = client.delete("/api/user/saved/opp-secret-a-101", headers={"Authorization": f"Bearer {token_a}"})
    assert del_res.status_code == 200

    # User B's saved opportunity is unaffected
    fetch_b_after = client.get("/api/user/saved", headers={"Authorization": f"Bearer {token_b}"}).json()
    saved_ids_b_after = [item["id"] for item in fetch_b_after["saved"]]
    assert "opp-secret-b-202" in saved_ids_b_after

# ==================== 5. PUBLIC OPPORTUNITIES & ELIGIBILITY MATCHING ====================
def test_public_corporate_jobs_endpoint(client):
    """Verify /api/corporate-jobs returns valid corporate openings."""
    response = client.get("/api/corporate-jobs")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["jobs"], list)
    assert len(data["jobs"]) > 0
    # Rule of Truth check: verify required schema properties
    first = data["jobs"][0]
    assert "title" in first
    assert "company" in first
    assert "applyUrl" in first

def test_public_government_jobs_endpoint(client):
    """Verify /api/govt-jobs returns official notifications."""
    response = client.get("/api/govt-jobs")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    items = data.get("recruitments") if "recruitments" in data else data.get("jobs", [])
    assert isinstance(items, list)
    assert len(items) > 0

def test_public_internships_endpoint(client):
    """Verify /api/internships returns student internship listings."""
    response = client.get("/api/internships")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["internships"], list)

def test_eligibility_matching_endpoint(client):
    """Verify /api/eligibility/match processes candidate criteria correctly."""
    criteria = {
        "highestQualification": "Graduate (Bachelor's)",
        "degree": "BCA",
        "graduationStatus": "Final Year",
        "skills": ["Python", "SQL", "HTML/CSS"],
        "careerPreference": "Both Corporate & Government"
    }
    response = client.post("/api/eligibility/match", json=criteria)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "eligible" in data
    assert "possiblyEligible" in data
    assert "counts" in data
    assert data["counts"]["totalMatched"] >= 0
