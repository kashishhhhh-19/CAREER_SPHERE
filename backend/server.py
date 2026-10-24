"""
CareerSphere - Production FastAPI Backend & Unified Ingestion Server
Serves production REST API endpoints and static frontend assets.

Public Endpoints:
  - GET  /api/health
  - GET  /api/corporate-jobs
  - GET  /api/govt-jobs
  - GET  /api/internships
  - GET  /api/companies
  - GET  /api/eligibility/match
  - POST /api/eligibility/match
  - GET  /api/notifications
  - GET  /api/sources
  - GET  /api/admin/stats
  - POST /api/sync/run
  - POST /api/sync/corporate
  - POST /api/sync/govt
  - POST /api/sync/internships
  - POST /api/sources/check
  - POST /api/notifications/mark-all-read
  - POST /api/notifications/{id}/read

Authenticated Endpoints:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET  /api/auth/me
  - GET  /api/user/profile
  - PUT  /api/user/profile
  - GET  /api/user/saved
  - POST /api/user/saved
  - DELETE /api/user/saved/{opportunity_id}
  - GET  /api/user/eligibility
  - PUT  /api/user/eligibility
"""

import os
import sys
import time
import json
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any

# Ensure project root in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI, Depends, HTTPException, Header, Request, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field

from backend.config import (
    HOST,
    PORT,
    DEBUG,
    ENVIRONMENT,
    CORS_ORIGINS,
    INGESTION_INTERVAL_SECONDS
)
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    validate_email_format,
    validate_password_strength
)
from backend.database import Database
from backend.storage import Storage
from backend.services.notification_checker import NotificationCheckerService
from backend.services.scheduler import IngestionScheduler
from backend.sources.corporate.public_feeds_adapter import CorporateLiveFeedsAdapter
from backend.sources.corporate.internships_adapter import InternshipsLiveAdapter
from backend.sources.govt.upsc_live_adapter import UPSCLiveAdapter
from backend.sources.govt.ncs_live_adapter import NCSLiveAdapter
from backend.sources.govt.rrb_live_adapter import RRBLiveAdapter
from backend.sources.govt.india_post_adapter import IndiaPostGDSAdapter
from backend.sources.govt.ssc_live_adapter import SSCLiveAdapter
from backend.sources.govt.state_govt_adapter import StateGovtRecruitmentAdapter
from backend.sources.employment_news import EmploymentNewsOfficialSource
from backend.sources.validator import DataValidator

def _now_iso():
    return datetime.now(timezone.utc).isoformat()

SERVER_START_TIME = _now_iso()
scheduler = IngestionScheduler(interval_seconds=INGESTION_INTERVAL_SECONDS)

# ==================== INGESTION & NOTIFICATION HELPERS ====================
def generate_corporate_notifications(validated):
    cats = validated.get('categories', [])
    comp_name = validated.get('company', 'Enterprise')
    job_title = validated.get('title', 'Software Role')
    apply_url = validated.get('applyUrl', '#')
    loc = validated.get('location', 'Pan India')
    notif_date = (validated.get('postedDate') if validated.get('postedDate') != 'Not available' else _now_iso())[:10]

    base_notif = {
        'id': f"notif-job-{validated['id']}",
        'organization': comp_name,
        'department': 'Corporate Tech Recruitment',
        'title': f"New Opening: {job_title} at {comp_name}",
        'notificationType': 'Private Jobs',
        'category': 'Private Jobs',
        'description': f"{comp_name} is actively hiring for {job_title} in {loc}. Apply directly via the official company career portal.",
        'sourceName': validated.get('sourceName') or f"{comp_name} Careers",
        'sourceUrl': apply_url,
        'publishedDate': validated.get('postedDate') or 'Not available',
        'notificationDate': notif_date,
        'applicationStartDate': validated.get('postedDate') or 'Not available',
        'applicationLastDate': validated.get('deadline') or 'Not available',
        'importantDates': {
            'applicationStartDate': validated.get('postedDate') or 'Not available',
            'applicationLastDate': validated.get('deadline') or 'Not available',
            'examDate': 'Not available'
        },
        'eligibility': validated.get('eligibility') or 'Not available',
        'qualification': validated.get('eligibility') or 'Not available',
        'location': loc,
        'vacancies': 'Not available',
        'applyUrl': apply_url,
        'officialNotificationUrl': apply_url,
        'officialSourceUrl': apply_url,
        'status': 'Open',
        'isNew': True,
        'isRead': False,
        'isDemo': False,
        'sourceIdentifier': f"notif-corp-base-{validated['id']}",
        'fetchedAt': _now_iso(),
        'lastUpdated': _now_iso()
    }
    v_b, ok_b, _ = DataValidator.validate_notification(base_notif)
    if ok_b:
        Storage.upsert_notification(v_b)

    if 'Fresher Jobs' in cats or 'Entry Level' in cats:
        fresher_notif = dict(base_notif)
        fresher_notif['id'] = f"notif-fresher-{validated['id']}"
        fresher_notif['notificationType'] = 'Fresher Opportunity'
        fresher_notif['title'] = f"Fresher Hiring: {job_title} ({comp_name})"
        fresher_notif['sourceIdentifier'] = f"notif-corp-fresher-{validated['id']}"
        v_f, ok_f, _ = DataValidator.validate_notification(fresher_notif)
        if ok_f:
            Storage.upsert_notification(v_f)

    if 'Internships' in cats or 'intern' in job_title.lower():
        intern_notif = dict(base_notif)
        intern_notif['id'] = f"notif-intern-{validated['id']}"
        intern_notif['category'] = 'Internships'
        intern_notif['notificationType'] = 'Internship Opportunity'
        intern_notif['title'] = f"Internship Opportunity: {job_title} ({comp_name})"
        intern_notif['sourceIdentifier'] = f"notif-corp-intern-{validated['id']}"
        v_i, ok_i, _ = DataValidator.validate_notification(intern_notif)
        if ok_i:
            Storage.upsert_notification(v_i)

    deadline_str = validated.get('deadline')
    if deadline_str and deadline_str != 'Not available':
        try:
            d_obj = datetime.strptime(deadline_str[:10], '%Y-%m-%d')
            days_left = (d_obj.date() - datetime.now().date()).days
            if 0 <= days_left <= 14:
                closing_notif = dict(base_notif)
                closing_notif['id'] = f"notif-closing-{validated['id']}"
                closing_notif['status'] = 'Closing Soon'
                closing_notif['notificationType'] = 'Closing Soon'
                closing_notif['title'] = f"Closing Soon ({days_left}d left): {job_title} at {comp_name}"
                closing_notif['sourceIdentifier'] = f"notif-corp-closing-{validated['id']}"
                v_c, ok_c, _ = DataValidator.validate_notification(closing_notif)
                if ok_c:
                    Storage.upsert_notification(v_c)
        except Exception:
            pass

    skills = validated.get('skills', [])
    for key_skill in ['Python', 'Java', 'SQL']:
        if key_skill in skills:
            skill_notif = dict(base_notif)
            skill_notif['id'] = f"notif-skill-{key_skill.lower()}-{validated['id']}"
            skill_notif['notificationType'] = f"{key_skill} Job Alert"
            skill_notif['title'] = f"{key_skill} Opportunity: {job_title} ({comp_name})"
            skill_notif['sourceIdentifier'] = f"notif-skill-{key_skill.lower()}-{validated['id']}"
            v_s, ok_s, _ = DataValidator.validate_notification(skill_notif)
            if ok_s:
                Storage.upsert_notification(v_s)
            break

def generate_internship_notifications(validated):
    cats = validated.get('categories', [])
    comp_name = validated.get('company', 'Enterprise')
    intern_title = validated.get('title', 'Internship Role')
    apply_url = validated.get('applyUrl', '#')
    loc = validated.get('location', 'Pan India')
    stipend = validated.get('stipend', 'Not available')
    duration = validated.get('duration', 'Not available')
    work_type = validated.get('workType', 'On-site')
    notif_date = (validated.get('postedDate') if validated.get('postedDate') != 'Not available' else _now_iso())[:10]

    base_notif = {
        'id': f"notif-intern-{validated['id']}",
        'organization': comp_name,
        'department': 'Internship Program',
        'title': f"New Internship: {intern_title} at {comp_name}",
        'notificationType': 'Internship Opportunity',
        'category': 'Internships',
        'description': f"{comp_name} is hiring for {intern_title} ({loc}). Stipend: {stipend}. Duration: {duration}. Apply directly at official portal.",
        'sourceName': validated.get('sourceName') or f"{comp_name} Careers",
        'sourceUrl': apply_url,
        'publishedDate': validated.get('postedDate') or 'Not available',
        'notificationDate': notif_date,
        'applicationStartDate': validated.get('postedDate') or 'Not available',
        'applicationLastDate': validated.get('deadline') or 'Not available',
        'importantDates': {
            'applicationStartDate': validated.get('postedDate') or 'Not available',
            'applicationLastDate': validated.get('deadline') or 'Not available',
            'examDate': 'Not available'
        },
        'eligibility': validated.get('eligibility') or 'Not available',
        'qualification': validated.get('eligibility') or 'Not available',
        'location': loc,
        'vacancies': 'Not available',
        'applyUrl': apply_url,
        'officialNotificationUrl': apply_url,
        'officialSourceUrl': apply_url,
        'status': 'Open',
        'isNew': True,
        'isRead': False,
        'isDemo': False,
        'sourceIdentifier': f"notif-intern-base-{validated['id']}",
        'fetchedAt': _now_iso(),
        'lastUpdated': _now_iso()
    }
    v_b, ok_b, _ = DataValidator.validate_notification(base_notif)
    if ok_b:
        Storage.upsert_notification(v_b)

    if 'BCA / IT' in cats or 'Computer Science' in cats:
        bcait_notif = dict(base_notif)
        bcait_notif['id'] = f"notif-intern-bcait-{validated['id']}"
        bcait_notif['notificationType'] = 'BCA/IT Internship Alert'
        bcait_notif['title'] = f"New BCA/IT Internship: {intern_title} ({comp_name})"
        bcait_notif['sourceIdentifier'] = f"notif-intern-bcait-{validated['id']}"
        v_f, ok_f, _ = DataValidator.validate_notification(bcait_notif)
        if ok_f:
            Storage.upsert_notification(v_f)

    if 'Remote' in cats or work_type.lower() == 'remote' or 'remote' in loc.lower():
        remote_notif = dict(base_notif)
        remote_notif['id'] = f"notif-intern-remote-{validated['id']}"
        remote_notif['notificationType'] = 'Remote Internship Alert'
        remote_notif['title'] = f"New Remote Internship: {intern_title} ({comp_name})"
        remote_notif['sourceIdentifier'] = f"notif-intern-remote-{validated['id']}"
        v_r, ok_r, _ = DataValidator.validate_notification(remote_notif)
        if ok_r:
            Storage.upsert_notification(v_r)

    deadline_str = validated.get('deadline')
    if deadline_str and deadline_str != 'Not available':
        try:
            d_obj = datetime.strptime(deadline_str[:10], '%Y-%m-%d')
            days_left = (d_obj.date() - datetime.now().date()).days
            if 0 <= days_left <= 14:
                closing_notif = dict(base_notif)
                closing_notif['id'] = f"notif-intern-closing-{validated['id']}"
                closing_notif['status'] = 'Closing Soon'
                closing_notif['notificationType'] = 'Internship Deadline Approaching'
                closing_notif['title'] = f"Internship Deadline Approaching ({days_left}d left): {intern_title} at {comp_name}"
                closing_notif['sourceIdentifier'] = f"notif-intern-closing-{validated['id']}"
                v_c, ok_c, _ = DataValidator.validate_notification(closing_notif)
                if ok_c:
                    Storage.upsert_notification(v_c)
        except Exception:
            pass

def ingest_govt_notices(notices):
    new_count = 0
    dup_count = 0
    valid_count = 0
    now_iso = _now_iso()

    for g in notices:
        validated, is_valid, _ = DataValidator.validate_govt_recruitment(g)
        if is_valid:
            valid_count += 1
            _, is_new = Database.upsert_govt_recruitment(validated)
            if is_new:
                new_count += 1
            else:
                dup_count += 1

            notif_date = (validated.get('fetchedAt') or now_iso)[:10]
            cat = validated.get('category') or 'Government Jobs'
            if 'examination' in (validated.get('postName') or '').lower() or 'schedule' in (validated.get('postName') or '').lower():
                notif_type = 'Exams'
            elif validated.get('status') == 'Closed':
                notif_type = 'Results'
            else:
                notif_type = 'Government Jobs'

            notif_id = validated.get('id', '').replace('govt-', 'notif-')
            if not notif_id.startswith('notif-'):
                notif_id = f"notif-{notif_id}"

            notif_data = {
                'id': notif_id,
                'type': 'government',
                'opportunityId': validated.get('id'),
                'organization': validated.get('organization') or 'Government of India',
                'department': validated.get('department') or 'Not available',
                'title': validated.get('postName') or validated.get('job_title', ''),
                'notificationType': notif_type,
                'category': cat,
                'description': validated.get('description', ''),
                'sourceName': validated.get('sourceName') or 'Official Government Recruitment Portal',
                'sourceUrl': validated.get('applyUrl', 'https://upsc.gov.in'),
                'publishedDate': validated.get('startDate') or 'Not available',
                'notificationDate': notif_date,
                'applicationStartDate': validated.get('startDate') or 'Not available',
                'applicationLastDate': validated.get('lastDate') or 'Not available',
                'importantDates': {
                    'applicationStartDate': validated.get('startDate') or 'Not available',
                    'applicationLastDate': validated.get('lastDate') or 'Not available',
                    'examDate': validated.get('examDate') or 'Not available'
                },
                'eligibility': validated.get('eligibility') or 'Not available',
                'qualification': validated.get('qualification') or 'Not available',
                'location': validated.get('location') or 'Not available',
                'vacancies': validated.get('vacancies') or 'Not available',
                'applyUrl': validated.get('applyUrl', 'https://upsc.gov.in'),
                'officialNotificationUrl': validated.get('officialPdfUrl') or validated.get('applyUrl', 'https://upsc.gov.in'),
                'officialSourceUrl': validated.get('officialPdfUrl') or validated.get('applyUrl', 'https://upsc.gov.in'),
                'status': validated.get('status', 'Open'),
                'isNew': True,
                'isRead': False,
                'isDemo': False,
                'sourceIdentifier': f"notif-{validated.get('sourceIdentifier', validated.get('id'))}",
                'fetchedAt': validated.get('fetchedAt') or now_iso,
                'lastUpdated': validated.get('fetchedAt') or now_iso
            }
            v_notif, notif_valid, _ = DataValidator.validate_notification(notif_data)
            if notif_valid:
                Storage.upsert_notification(v_notif)

    return valid_count, new_count, dup_count

def execute_live_data_sync():
    corp_jobs = CorporateLiveFeedsAdapter.fetch_all_real_jobs()
    new_corp = 0
    dup_corp = 0
    valid_corp = 0
    for j in corp_jobs:
        validated, is_valid, _ = DataValidator.validate_corporate_job(j)
        if is_valid:
            valid_corp += 1
            _, is_new = Database.upsert_corporate_job(validated)
            if is_new:
                new_corp += 1
            else:
                dup_corp += 1
            generate_corporate_notifications(validated)

    upsc_notices, upsc_err = UPSCLiveAdapter.fetch_live_announcements()
    rrb_notices, rrb_err = RRBLiveAdapter.fetch_live_notices()
    gds_notices, gds_err = IndiaPostGDSAdapter.fetch_live_notices()
    ncs_notices, ncs_err = NCSLiveAdapter.fetch_live_updates()
    ssc_notices, ssc_err = SSCLiveAdapter.fetch_live_notices()
    state_notices, state_err = StateGovtRecruitmentAdapter.fetch_live_notices()
    en_notices, en_err = EmploymentNewsOfficialSource.fetch_updates()

    all_govt = upsc_notices + rrb_notices + gds_notices + ncs_notices + ssc_notices + state_notices + en_notices
    valid_govt, new_govt, dup_govt = ingest_govt_notices(all_govt)
    govt_errors = [e for e in [upsc_err, rrb_err, gds_err, ncs_err, ssc_err, state_err, en_err] if e]

    intern_list, intern_err = InternshipsLiveAdapter.fetch_live_internships()
    new_intern = 0
    dup_intern = 0
    valid_intern = 0
    for it in intern_list:
        validated, is_valid, _ = DataValidator.validate_corporate_job(it)
        if is_valid:
            valid_intern += 1
            _, is_new = Database.upsert_internship(validated)
            if is_new:
                new_intern += 1
            else:
                dup_intern += 1
            generate_internship_notifications(validated)

    check_report = NotificationCheckerService.check_all_sources()

    return {
        'corporate': {
            'fetched': len(corp_jobs),
            'validated': valid_corp,
            'newImported': new_corp,
            'duplicatesUpdated': dup_corp
        },
        'govt': {
            'source': 'Verified Official Portals (UPSC, Railway Recruitment Boards, India Post GDS, NCS, SSC, State PSC, Employment News)',
            'fetched': len(all_govt),
            'validated': valid_govt,
            'newImported': new_govt,
            'duplicatesUpdated': dup_govt,
            'sources': {
                'upsc': len(upsc_notices),
                'rrb': len(rrb_notices),
                'indiaPost': len(gds_notices),
                'ncs': len(ncs_notices),
                'ssc': len(ssc_notices),
                'stateGovt': len(state_notices),
                'employmentNews': len(en_notices)
            },
            'errors': govt_errors
        },
        'internships': {
            'source': 'Verified Authentic Internship Portals (The Muse Public API, Amazon Jobs India, Arbeitnow Feeds)',
            'fetched': len(intern_list),
            'validated': valid_intern,
            'newImported': new_intern,
            'duplicatesUpdated': dup_intern,
            'errors': [intern_err] if intern_err else []
        },
        'sourceCheck': check_report,
        'dbStats': Database.get_stats()
    }

# ==================== LIFESPAN CONTEXT ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start periodic background ingestion worker (skip during automated tests)
    if ENVIRONMENT != 'test' and os.getenv('TESTING') != '1':
        scheduler.start(execute_live_data_sync)
        print(f"\n[CareerSphere] Background Ingestion Scheduler started ({INGESTION_INTERVAL_SECONDS}s interval).")
    yield
    # Shutdown
    if scheduler._thread and scheduler._thread.is_alive():
        print("[CareerSphere] Shutting down scheduler...")
        scheduler.stop()

app = FastAPI(
    title="CareerSphere API",
    description="Unified Enterprise & Sarkari Career Ecosystem Production API with Secure Authentication & Real-World Ingestion",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ==================== MIDDLEWARE ====================
# 1. CORS Middleware
is_wildcard = CORS_ORIGINS == ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Production Security Headers & Rate-Limiting Middleware (Pure ASGI)
AUTH_ATTEMPTS: Dict[str, List[float]] = {}
MAX_AUTH_ATTEMPTS_PER_MINUTE = 15

class SecurityAndRateLimitMiddleware:
    def __init__(self, app_instance):
        self.app = app_instance

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        path = scope.get("path", "")
        if path.startswith("/api/auth/login") or path.startswith("/api/auth/register"):
            client_info = scope.get("client")
            client_ip = client_info[0] if client_info else "unknown"
            now = time.time()
            attempts = AUTH_ATTEMPTS.get(client_ip, [])
            attempts = [t for t in attempts if now - t < 60.0]
            if len(attempts) >= MAX_AUTH_ATTEMPTS_PER_MINUTE:
                response = JSONResponse(
                    status_code=429,
                    content={"success": False, "error": "Too many authentication requests. Please try again in 1 minute."}
                )
                return await response(scope, receive, send)
            attempts.append(now)
            AUTH_ATTEMPTS[client_ip] = attempts

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                raw_headers = list(message.get("headers", []))
                raw_headers.append((b"x-content-type-options", b"nosniff"))
                raw_headers.append((b"x-frame-options", b"SAMEORIGIN"))
                raw_headers.append((b"x-xss-protection", b"1; mode=block"))
                raw_headers.append((b"referrer-policy", b"strict-origin-when-cross-origin"))
                message["headers"] = raw_headers
            await send(message)

        await self.app(scope, receive, send_wrapper)

app.add_middleware(SecurityAndRateLimitMiddleware)

# ==================== AUTHENTICATION DEPENDENCY ====================
async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Validates JWT bearer token and injects authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing or malformed."
        )
    token = authorization.split("Bearer ", 1)[1].strip()
    payload = decode_access_token(token)
    if not payload or not payload.get('sub'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please log in again."
        )
    user = Database.get_user_by_id(payload['sub'])
    if not user or not user.get('isActive'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or disabled."
        )
    return user

# ==================== PYDANTIC MODELS ====================
class RegisterRequest(BaseModel):
    email: str = Field(..., example="candidate@realm.com")
    password: str = Field(..., min_length=8, example="StrongPass123!")
    fullName: str = Field(..., min_length=2, example="Arya Stark")
    avatar: Optional[str] = Field("👤", example="👤")
    qualification: Optional[str] = None
    degree: Optional[str] = None

class LoginRequest(BaseModel):
    email: str = Field(..., example="candidate@realm.com")
    password: str = Field(..., example="StrongPass123!")

class ProfileUpdateRequest(BaseModel):
    phone: Optional[str] = None
    bio: Optional[str] = None
    highestQualification: Optional[str] = None
    degree: Optional[str] = None
    graduationStatus: Optional[str] = None
    graduationYear: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    preferredLocations: Optional[List[str]] = None
    preferredSectors: Optional[List[str]] = None
    preferredJobType: Optional[str] = None
    careerPreference: Optional[str] = None
    workPreference: Optional[str] = None
    resumeData: Optional[Dict[str, Any]] = None

class SaveOpportunityRequest(BaseModel):
    id: str = Field(..., example="corp-amazon-1")
    type: Optional[str] = Field("corporate", example="corporate")
    title: Optional[str] = None
    organization: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    deadline: Optional[str] = None
    salary: Optional[str] = None
    applyUrl: Optional[str] = None
    sourceName: Optional[str] = None
    isDemo: Optional[bool] = False

class EligibilityCriteriaRequest(BaseModel):
    highestQualification: Optional[str] = None
    degree: Optional[str] = None
    graduationStatus: Optional[str] = None
    graduationYear: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    preferredLocation: Optional[str] = None
    preferredJobType: Optional[str] = None
    careerPreference: Optional[str] = "Both Corporate & Government"

class ReadNotificationRequest(BaseModel):
    read: bool = True

# ==================== 1. SYSTEM HEALTH CHECK ====================
@app.get("/api/health")
def health_check():
    """Health check for load balancers and deployment monitoring."""
    db_stats = Database.get_stats()
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "timestamp": _now_iso(),
        "serverStartTime": SERVER_START_TIME,
        "database": {
            "status": "connected",
            "stats": db_stats
        },
        "scheduler": {
            "intervalSeconds": scheduler.interval_seconds,
            "lastRunTime": scheduler.last_run_time
        }
    }

# ==================== 2. AUTHENTICATION ENDPOINTS ====================
@app.post("/api/auth/register")
def register_user(req: RegisterRequest):
    """Registers a new candidate account with bcrypt hashing and initializes profile."""
    if not validate_email_format(req.email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    
    is_strong, pwd_err = validate_password_strength(req.password)
    if not is_strong:
        raise HTTPException(status_code=400, detail=pwd_err)
    
    password_hash = hash_password(req.password)
    user, err = Database.create_user(
        email=req.email,
        password_hash=password_hash,
        full_name=req.fullName,
        avatar=req.avatar or "👤"
    )
    if err:
        raise HTTPException(status_code=409, detail=err)

    # If initial qualification/degree provided, persist to profile
    if req.qualification or req.degree:
        Database.upsert_user_profile(user['id'], {
            'highestQualification': req.qualification or "Graduate (Bachelor's)",
            'degree': req.degree or ""
        })

    profile = Database.get_user_profile(user['id'])
    token = create_access_token({'sub': user['id'], 'email': user['email']})
    return {
        "success": True,
        "message": "Welcome to CareerSphere! Your candidate realm account is forged.",
        "token": token,
        "user": user,
        "profile": profile
    }

@app.post("/api/auth/login")
def login_user(req: LoginRequest):
    """Authenticates credentials, returns JWT token and candidate profile."""
    clean_email = req.email.strip().lower()
    user = Database.get_user_by_email(clean_email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    if not verify_password(req.password, user['passwordHash']):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    safe_user = {
        'id': user['id'],
        'email': user['email'],
        'fullName': user['fullName'],
        'avatar': user['avatar'],
        'role': user['role'],
        'createdAt': user['createdAt']
    }
    profile = Database.get_user_profile(user['id'])
    token = create_access_token({'sub': user['id'], 'email': user['email']})
    return {
        "success": True,
        "message": "Authentication successful.",
        "token": token,
        "user": safe_user,
        "profile": profile
    }

@app.post("/api/auth/logout")
def logout_user():
    """Client-side token disposal endpoint."""
    return {"success": True, "message": "Successfully logged out."}

@app.get("/api/auth/me")
def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Fetches details of the currently authenticated user."""
    profile = Database.get_user_profile(current_user['id'])
    return {
        "success": True,
        "user": current_user,
        "profile": profile
    }

# ==================== 3. USER PROFILE (PROTECTED) ====================
@app.get("/api/user/profile")
def fetch_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Fetches user profile for authenticated user."""
    profile = Database.get_user_profile(current_user['id'])
    return {"success": True, "profile": profile}

@app.put("/api/user/profile")
def update_user_profile(req: ProfileUpdateRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Updates user profile and keeps eligibility criteria in sync."""
    data = req.dict(exclude_unset=True)
    updated = Database.upsert_user_profile(current_user['id'], data)
    return {"success": True, "message": "Profile updated successfully.", "profile": updated}

# ==================== 4. USER SAVED OPPORTUNITIES (ISOLATED) ====================
@app.get("/api/user/saved")
def fetch_user_saved_opportunities(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Fetches all saved opportunities specifically bookmarked by this user."""
    items = Database.get_user_saved_opportunities(current_user['id'])
    return {"success": True, "count": len(items), "saved": items}

@app.post("/api/user/saved")
def save_user_opportunity(req: SaveOpportunityRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Saves a bookmark for authenticated user."""
    opp_dict = req.dict()
    saved, is_new = Database.save_user_opportunity(current_user['id'], opp_dict)
    return {
        "success": True,
        "isNew": is_new,
        "message": "Opportunity bookmarked successfully." if is_new else "Opportunity already in your saved archive.",
        "opportunity": saved
    }

@app.delete("/api/user/saved/{opportunity_id}")
def unsave_user_opportunity(opportunity_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Removes a bookmark for authenticated user."""
    deleted = Database.unsave_user_opportunity(current_user['id'], opportunity_id)
    return {"success": deleted, "message": "Bookmark removed." if deleted else "Opportunity was not saved."}

# ==================== 5. USER ELIGIBILITY PREFERENCES ====================
@app.get("/api/user/eligibility")
def fetch_user_eligibility(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Fetches user eligibility preferences."""
    elig = Database.get_user_eligibility(current_user['id'])
    return {"success": True, "eligibility": elig}

@app.put("/api/user/eligibility")
def update_user_eligibility(req: EligibilityCriteriaRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Updates user eligibility preferences."""
    data = req.dict(exclude_unset=True)
    updated = Database.upsert_user_eligibility(current_user['id'], data)
    return {"success": True, "message": "Eligibility preferences updated.", "eligibility": updated}

# ==================== 6. PUBLIC OPPORTUNITIES APIS ====================
@app.get("/api/corporate-jobs")
def get_corporate_jobs(
    category: Optional[str] = None,
    company: Optional[str] = None,
    roleCategory: Optional[str] = None,
    experience: Optional[str] = None,
    workType: Optional[str] = None,
    search: Optional[str] = None,
    isDemo: Optional[str] = None
):
    """Fetches real, verified corporate jobs according to Rule of Truth."""
    is_demo = False
    if isDemo is not None:
        if isDemo.lower() in ('true', '1'):
            is_demo = True
        elif isDemo.lower() == 'all':
            is_demo = None

    jobs = Database.get_corporate_jobs(
        category=category,
        company=company,
        role_category=roleCategory,
        experience=experience,
        work_type=workType,
        search=search,
        is_demo=is_demo
    )

    # Auto-seed if database has 0 records
    if len(jobs) == 0 and not is_demo:
        try:
            live_jobs, _ = CorporateLiveFeedsAdapter.fetch_live_jobs()
            for j in live_jobs:
                validated, is_valid, _ = DataValidator.validate_corporate_job(j)
                if is_valid:
                    Database.upsert_corporate_job(validated)
                    generate_corporate_notifications(validated)
            jobs = Database.get_corporate_jobs(
                category=category,
                company=company,
                role_category=roleCategory,
                experience=experience,
                work_type=workType,
                search=search,
                is_demo=False
            )
        except Exception as e:
            print(f"[Server] Auto-seed corporate jobs error: {e}")

    latest_updated = None
    for j in jobs:
        f_time = j.get('updatedAt') or j.get('updated_at') or j.get('createdAt')
        if f_time and f_time != 'Not available':
            if not latest_updated or str(f_time) > str(latest_updated):
                latest_updated = str(f_time)
    if not latest_updated:
        latest_updated = _now_iso()

    source_status = 'Operational' if len(jobs) > 0 else 'Source unavailable'
    real_count = len(jobs) if not is_demo else 0

    return {
        'success': True,
        'source': 'Verified Official Corporate Careers (Amazon, Infosys, Wipro, Deloitte, IBM, Capgemini, Arbeitnow, Remotive)',
        'sourceStatus': source_status,
        'lastUpdated': latest_updated,
        'realRecordsReturned': real_count,
        'count': len(jobs),
        'jobs': jobs
    }

@app.get("/api/govt-jobs")
def get_govt_jobs(
    category: Optional[str] = None,
    qualification: Optional[str] = None,
    search: Optional[str] = None,
    source: Optional[str] = None,
    organization: Optional[str] = None,
    isDemo: Optional[str] = None
):
    """Fetches real government recruitments and official notices."""
    is_demo = False
    if isDemo is not None:
        if isDemo.lower() in ('true', '1'):
            is_demo = True
        elif isDemo.lower() == 'all':
            is_demo = None

    recruitments = Database.get_govt_recruitments(
        category=category,
        qualification=qualification,
        search=search,
        source=source,
        organization=organization,
        is_demo=is_demo
    )

    if len(recruitments) == 0 and not is_demo:
        try:
            upsc_notices, _ = UPSCLiveAdapter.fetch_live_announcements()
            rrb_notices, _ = RRBLiveAdapter.fetch_live_notices()
            gds_notices, _ = IndiaPostGDSAdapter.fetch_live_notices()
            ncs_notices, _ = NCSLiveAdapter.fetch_live_updates()
            ssc_notices, _ = SSCLiveAdapter.fetch_live_notices()
            state_notices, _ = StateGovtRecruitmentAdapter.fetch_live_notices()
            en_notices, _ = EmploymentNewsOfficialSource.fetch_updates()
            all_govt = upsc_notices + rrb_notices + gds_notices + ncs_notices + ssc_notices + state_notices + en_notices
            ingest_govt_notices(all_govt)
            recruitments = Database.get_govt_recruitments(
                category=category,
                qualification=qualification,
                search=search,
                source=source,
                organization=organization,
                is_demo=False
            )
        except Exception as e:
            print(f"[Server] Auto-seed govt recruitments error: {e}")

    latest_updated = None
    for r in recruitments:
        f_time = r.get('fetchedAt') or r.get('updatedAt')
        if f_time and f_time != 'Not available':
            if not latest_updated or str(f_time) > str(latest_updated):
                latest_updated = str(f_time)
    if not latest_updated:
        latest_updated = _now_iso()

    source_status = 'Operational' if len(recruitments) > 0 else 'Source unavailable'
    real_count = len(recruitments) if not is_demo else 0

    return {
        'success': True,
        'source': 'Verified Official Central & State Government Portals (UPSC, Railway Recruitment Boards, India Post GDS, National Career Service)',
        'sourceStatus': source_status,
        'lastUpdated': latest_updated,
        'realRecordsReturned': real_count,
        'count': len(recruitments),
        'recruitments': recruitments
    }

@app.get("/api/internships")
def get_internships(
    category: Optional[str] = None,
    location: Optional[str] = None,
    workType: Optional[str] = None,
    stipendType: Optional[str] = None,
    search: Optional[str] = None,
    isDemo: Optional[str] = None
):
    """Fetches real internships from verified feeds."""
    is_demo = False
    if isDemo is not None:
        if isDemo.lower() in ('true', '1'):
            is_demo = True
        elif isDemo.lower() == 'all':
            is_demo = None

    internships = Database.get_internships(
        category=category,
        location=location,
        work_type=workType,
        stipend_type=stipendType,
        search=search,
        is_demo=is_demo
    )

    if len(internships) == 0 and not is_demo:
        try:
            live_interns, _ = InternshipsLiveAdapter.fetch_all_real_internships()
            for it in live_interns:
                validated, is_valid, _ = DataValidator.validate_corporate_job(it)
                if is_valid:
                    Database.upsert_internship(validated)
                    generate_internship_notifications(validated)
            internships = Database.get_internships(
                category=category,
                location=location,
                work_type=workType,
                stipend_type=stipendType,
                search=search,
                is_demo=False
            )
        except Exception as e:
            print(f"[Server] Auto-seed internships error: {e}")

    latest_updated = None
    for it in internships:
        f_time = it.get('updatedAt') or it.get('updated_at') or it.get('createdAt')
        if f_time and f_time != 'Not available':
            if not latest_updated or str(f_time) > str(latest_updated):
                latest_updated = str(f_time)
    if not latest_updated:
        latest_updated = _now_iso()

    source_status = 'Operational' if len(internships) > 0 else 'Source unavailable'
    real_count = len(internships) if not is_demo else 0

    return {
        'success': True,
        'source': 'Verified Authentic Internship Portals (The Muse Public API, Amazon Jobs India, Arbeitnow Feeds)',
        'sourceStatus': source_status,
        'lastUpdated': latest_updated,
        'realRecordsReturned': real_count,
        'count': len(internships),
        'internships': internships
    }

@app.get("/api/companies")
def get_companies():
    """Fetches live corporate employers directory status."""
    companies = Database.get_companies_status()
    latest_updated = _now_iso()
    for c in companies:
        lu = c.get('lastChecked')
        if lu and lu != 'Not available':
            if str(lu) > str(latest_updated):
                latest_updated = str(lu)

    return {
        'success': True,
        'source': 'Verified Official Enterprise Career Portals (TCS, Infosys, Wipro, Accenture, Cognizant, IBM, Microsoft, Amazon, Google, Capgemini, Deloitte, HCLTech, Tech Mahindra)',
        'sourceStatus': 'Operational',
        'lastUpdated': latest_updated,
        'count': len(companies),
        'companies': companies
    }

@app.get("/api/eligibility/match")
def match_eligibility_get(
    highestQualification: Optional[str] = None,
    qualification: Optional[str] = None,
    degree: Optional[str] = None,
    graduationStatus: Optional[str] = None,
    graduationYear: Optional[str] = None,
    experience: Optional[str] = None,
    skills: Optional[str] = None,
    preferredLocation: Optional[str] = None,
    preferredJobType: Optional[str] = None,
    careerPreference: Optional[str] = 'Both Corporate & Government'
):
    """Eligibility matching engine (GET)."""
    skills_list = [s.strip() for s in (skills or '').split(',') if s.strip()]
    criteria = {
        'highestQualification': highestQualification or qualification,
        'degree': degree,
        'graduationStatus': graduationStatus,
        'graduationYear': graduationYear,
        'experience': experience,
        'skills': skills_list,
        'preferredLocation': preferredLocation,
        'preferredJobType': preferredJobType,
        'careerPreference': careerPreference
    }
    results = Database.match_eligibility(criteria)
    return {'success': True, **results}

@app.post("/api/eligibility/match")
def match_eligibility_post(criteria: Dict[str, Any]):
    """Eligibility matching engine (POST)."""
    results = Database.match_eligibility(criteria)
    return {'success': True, **results}

@app.get("/api/notifications")
def get_notifications(
    category: Optional[str] = None,
    source: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = 'newest',
    isDemo: Optional[str] = None
):
    """Fetches real notifications list."""
    is_demo = False
    if isDemo is not None:
        if isDemo.lower() in ('true', '1'):
            is_demo = True
        elif isDemo.lower() == 'all':
            is_demo = None

    notifs = Storage.get_notifications(
        category=category,
        source=source,
        status=status,
        search=search,
        sort=sort,
        is_demo=is_demo
    )
    latest_updated = None
    for n in notifs:
        f_time = n.get('fetchedAt') or n.get('lastUpdated') or n.get('updatedAt')
        if f_time and f_time != 'Not available':
            if not latest_updated or str(f_time) > str(latest_updated):
                latest_updated = str(f_time)
    if not latest_updated:
        latest_updated = _now_iso()

    source_status = 'Operational' if len(notifs) > 0 else 'Source unavailable'
    real_count = len(notifs) if not is_demo else 0

    return {
        'success': True,
        'source': 'Union Public Service Commission (UPSC)',
        'sourceStatus': source_status,
        'lastUpdated': latest_updated,
        'realNotificationsReturned': real_count,
        'count': len(notifs),
        'notifications': notifs
    }

@app.get("/api/sources")
def get_sources():
    """Fetches configured data sources."""
    sources = Storage.get_sources()
    return {'success': True, 'count': len(sources), 'sources': sources}

@app.get("/api/admin/stats")
def get_admin_stats():
    """Admin operational statistics."""
    notif_stats = Storage.get_stats()
    db_stats = Database.get_stats()
    combined_stats = {
        **notif_stats,
        'corporateJobs': db_stats['corporate'],
        'govtRecruitments': db_stats['govt'],
        'internships': db_stats.get('internships', {'total': 0, 'demo': 0, 'real': 0}),
        'scheduler': {
            'intervalSeconds': scheduler.interval_seconds,
            'lastRunTime': scheduler.last_run_time
        }
    }
    return {'success': True, 'stats': combined_stats}

# ==================== 7. DATA SYNCHRONIZATION ENDPOINTS ====================
@app.post("/api/sync/run")
def trigger_sync_all():
    """Executes live data sync across all sources."""
    result = execute_live_data_sync()
    return {'success': True, **result}

@app.post("/api/sync/corporate")
def trigger_sync_corporate():
    """Syncs corporate jobs."""
    live_jobs, corp_err = CorporateLiveFeedsAdapter.fetch_live_jobs()
    new_c = 0
    dup_c = 0
    valid_c = 0
    now_iso = _now_iso()
    for j in live_jobs:
        validated, is_valid, _ = DataValidator.validate_corporate_job(j)
        if is_valid:
            valid_c += 1
            _, is_new = Database.upsert_corporate_job(validated)
            if is_new:
                new_c += 1
            else:
                dup_c += 1
            generate_corporate_notifications(validated)

    updated_jobs = Database.get_corporate_jobs(is_demo=False)
    return {
        'success': True,
        'source': 'Verified Official Corporate Careers (Amazon, Infosys, Wipro, Deloitte, IBM, Capgemini, Arbeitnow, Remotive)',
        'fetched': len(live_jobs),
        'valid': valid_c,
        'new': new_c,
        'updated': dup_c,
        'error': corp_err,
        'lastUpdated': now_iso,
        'count': len(updated_jobs),
        'jobs': updated_jobs
    }

@app.post("/api/sync/govt")
def trigger_sync_govt():
    """Syncs government recruitments."""
    upsc_notices, upsc_err = UPSCLiveAdapter.fetch_live_announcements()
    rrb_notices, rrb_err = RRBLiveAdapter.fetch_live_notices()
    gds_notices, gds_err = IndiaPostGDSAdapter.fetch_live_notices()
    ncs_notices, ncs_err = NCSLiveAdapter.fetch_live_updates()

    all_govt = upsc_notices + rrb_notices + gds_notices + ncs_notices
    valid_g, new_g, dup_g = ingest_govt_notices(all_govt)
    now_iso = _now_iso()
    errs = [e for e in [upsc_err, rrb_err, gds_err, ncs_err] if e]
    updated_jobs = Database.get_govt_recruitments(is_demo=False)

    return {
        'success': True,
        'source': 'Verified Official Central & State Government Portals (UPSC, Railway Recruitment Boards, India Post GDS, National Career Service)',
        'fetched': len(all_govt),
        'valid': valid_g,
        'new': new_g,
        'updated': dup_g,
        'errors': errs,
        'sources': {
            'upsc': len(upsc_notices),
            'rrb': len(rrb_notices),
            'indiaPost': len(gds_notices),
            'ncs': len(ncs_notices)
        },
        'lastUpdated': now_iso,
        'count': len(updated_jobs),
        'recruitments': updated_jobs
    }

@app.post("/api/sync/internships")
def trigger_sync_internships():
    """Syncs internships."""
    live_interns, intern_err = InternshipsLiveAdapter.fetch_all_real_internships()
    new_it = 0
    dup_it = 0
    valid_it = 0
    now_iso = _now_iso()
    for it in live_interns:
        validated, is_valid, _ = DataValidator.validate_corporate_job(it)
        if is_valid:
            valid_it += 1
            _, is_new = Database.upsert_internship(validated)
            if is_new:
                new_it += 1
            else:
                dup_it += 1
            generate_internship_notifications(validated)

    updated_interns = Database.get_internships(is_demo=False)
    return {
        'success': True,
        'source': 'Verified Authentic Internship Portals (The Muse Public API, Amazon Jobs India, Arbeitnow Feeds)',
        'fetched': len(live_interns),
        'valid': valid_it,
        'new': new_it,
        'updated': dup_it,
        'error': intern_err,
        'lastUpdated': now_iso,
        'count': len(updated_interns),
        'internships': updated_interns
    }

@app.post("/api/sources/check")
def trigger_sources_check():
    """Runs source health verification."""
    report = NotificationCheckerService.check_all_sources()
    return {'success': True, 'report': report}

@app.post("/api/notifications/mark-all-read")
def mark_all_notifications_read():
    """Marks all notifications as read."""
    count = Storage.mark_all_read()
    return {'success': True, 'markedCount': count}

@app.post("/api/notifications/{notification_id}/read")
def mark_single_notification_read(notification_id: str, req: ReadNotificationRequest):
    """Marks single notification read/unread."""
    ok = Storage.mark_notification_read(notification_id, req.read)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {'success': True, 'id': notification_id, 'read': req.read}

# ==================== 8. STATIC FILES & SINGLE PAGE APPLICATION ====================
# Mount static assets
if os.path.exists(os.path.join(BASE_DIR, 'css')):
    app.mount("/css", StaticFiles(directory=os.path.join(BASE_DIR, 'css')), name="css")
if os.path.exists(os.path.join(BASE_DIR, 'js')):
    app.mount("/js", StaticFiles(directory=os.path.join(BASE_DIR, 'js')), name="js")
if os.path.exists(os.path.join(BASE_DIR, 'assets')):
    app.mount("/assets", StaticFiles(directory=os.path.join(BASE_DIR, 'assets')), name="assets")

INDEX_HTML_PATH = os.path.join(BASE_DIR, 'index.html')

@app.get("/")
def serve_index():
    """Serves Single Page Application index.html."""
    if os.path.exists(INDEX_HTML_PATH):
        return FileResponse(INDEX_HTML_PATH, media_type="text/html")
    raise HTTPException(status_code=404, detail="index.html not found.")

@app.get("/{full_path:path}")
def serve_spa_catchall(full_path: str):
    """SPA fallback: serves static files if they exist, otherwise returns index.html for client routing."""
    # Never intercept /api/*
    if full_path.startswith("api/") or full_path == "api":
        raise HTTPException(status_code=404, detail="API endpoint not found.")
    
    file_path = os.path.join(BASE_DIR, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    if os.path.exists(INDEX_HTML_PATH):
        return FileResponse(INDEX_HTML_PATH, media_type="text/html")
    raise HTTPException(status_code=404, detail="File not found.")

def run():
    import uvicorn
    print(f"\n=======================================================")
    print(f" CareerSphere Production FastAPI & Ingestion Engine")
    print(f" Environment : {ENVIRONMENT.upper()}")
    print(f" Server URL  : http://localhost:{PORT}")
    print(f" API Docs    : http://localhost:{PORT}/docs")
    print(f" ReDoc       : http://localhost:{PORT}/redoc")
    print(f" Health Check: http://localhost:{PORT}/api/health")
    print(f"=======================================================\n")
    uvicorn.run("backend.server:app", host=HOST, port=PORT, reload=DEBUG)

if __name__ == '__main__':
    run()
