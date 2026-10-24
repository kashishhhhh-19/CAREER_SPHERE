"""
CareerSphere - Unified HTTP Web & Real Ingestion API Server
Serves static frontend assets and REST API endpoints on port 8000.
Endpoints:
  - GET  /api/corporate-jobs
  - GET  /api/govt-jobs
  - GET  /api/notifications
  - GET  /api/sources
  - POST /api/sync/run (Syncs real corporate and govt data)
  - POST /api/sources/check
  - GET  /api/admin/stats
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, ThreadingHTTPServer, SimpleHTTPRequestHandler

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

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
from datetime import datetime, timezone

def _now_iso():
    return datetime.now(timezone.utc).isoformat()

PORT = 8000

scheduler = IngestionScheduler(interval_seconds=14400)

def generate_corporate_notifications(validated):
    cats = validated.get('categories', [])
    comp_name = validated.get('company', 'Enterprise')
    job_title = validated.get('title', 'Software Role')
    apply_url = validated.get('applyUrl', '#')
    loc = validated.get('location', 'Pan India')
    notif_date = (validated.get('postedDate') if validated.get('postedDate') != 'Not available' else _now_iso())[:10]

    # 1. Base Job Opening Alert
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

    # 2. Fresher Opportunity Alert
    if 'Fresher Jobs' in cats or 'Entry Level' in cats:
        fresher_notif = dict(base_notif)
        fresher_notif['id'] = f"notif-fresher-{validated['id']}"
        fresher_notif['notificationType'] = 'Fresher Opportunity'
        fresher_notif['title'] = f"Fresher Hiring: {job_title} ({comp_name})"
        fresher_notif['sourceIdentifier'] = f"notif-corp-fresher-{validated['id']}"
        v_f, ok_f, _ = DataValidator.validate_notification(fresher_notif)
        if ok_f:
            Storage.upsert_notification(v_f)

    # 3. Internship Alert
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

    # 4. Closing Soon Alert (ONLY if actual deadline is available and within 14 days)
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

    # 5. Skill-specific Notification
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

    # 1. Base New Internship Alert
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

    # 2. BCA / IT Internship Alert
    if 'BCA / IT' in cats or 'Computer Science' in cats:
        bcait_notif = dict(base_notif)
        bcait_notif['id'] = f"notif-intern-bcait-{validated['id']}"
        bcait_notif['notificationType'] = 'BCA/IT Internship Alert'
        bcait_notif['title'] = f"New BCA/IT Internship: {intern_title} ({comp_name})"
        bcait_notif['sourceIdentifier'] = f"notif-intern-bcait-{validated['id']}"
        v_f, ok_f, _ = DataValidator.validate_notification(bcait_notif)
        if ok_f:
            Storage.upsert_notification(v_f)

    # 3. Remote Internship Alert
    if 'Remote' in cats or work_type.lower() == 'remote' or 'remote' in loc.lower():
        remote_notif = dict(base_notif)
        remote_notif['id'] = f"notif-intern-remote-{validated['id']}"
        remote_notif['notificationType'] = 'Remote Internship Alert'
        remote_notif['title'] = f"New Remote Internship: {intern_title} ({comp_name})"
        remote_notif['sourceIdentifier'] = f"notif-intern-remote-{validated['id']}"
        v_r, ok_r, _ = DataValidator.validate_notification(remote_notif)
        if ok_r:
            Storage.upsert_notification(v_r)

    # 4. Internship Deadline Approaching Alert (ONLY if actual deadline exists and is within 14 days)
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
    """
    Validates government notices, upserts into SQLite database,
    and creates notifications according to the Rule of Truth.
    """
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

            # Ingest into notifications store adhering strictly to Rule of Truth
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
    """
    Executes live data sync across corporate feeds, official government portals, and verified internships,
    validates items, upserts into SQLite and notifications storage, and updates source health.
    """
    # 1. Corporate Feeds
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

    # 2. Government Announcements (UPSC, RRB, India Post GDS, NCS, SSC, State PSC, Employment News)
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

    # 3. Verified Internship Feeds
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

    # 4. Source health updates
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

class CareerSphereHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _send_json(self, status_code, payload):
        data = json.dumps(payload).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(data)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # 1. API: Corporate Jobs & Internships
        if path == '/api/corporate-jobs':
            category = query.get('category', [None])[0]
            company = query.get('company', [None])[0]
            role_cat = query.get('roleCategory', [None])[0]
            experience = query.get('experience', [None])[0]
            work_type = query.get('workType', [None])[0]
            search = query.get('search', [None])[0]
            is_demo_param = query.get('isDemo', [None])[0]
            
            # Pure real records by default. Never mix demo with live.
            is_demo = False
            if is_demo_param is not None:
                if is_demo_param.lower() in ('true', '1'):
                    is_demo = True
                elif is_demo_param.lower() == 'all':
                    is_demo = None

            jobs = Database.get_corporate_jobs(
                category=category,
                company=company,
                role_category=role_cat,
                experience=experience,
                work_type=work_type,
                search=search,
                is_demo=is_demo
            )

            # Auto-seed from live feeds if database has 0 real jobs
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
                        role_category=role_cat,
                        experience=experience,
                        work_type=work_type,
                        search=search,
                        is_demo=False
                    )
                except Exception as e:
                    print(f"[Server] Auto-seed corporate jobs error: {e}")

            # Compute most recent updated timestamp
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

            self._send_json(200, {
                'success': True,
                'source': 'Verified Official Corporate Careers (Amazon, Infosys, Wipro, Deloitte, IBM, Capgemini, Arbeitnow, Remotive)',
                'sourceStatus': source_status,
                'lastUpdated': latest_updated,
                'realRecordsReturned': real_count,
                'count': len(jobs),
                'jobs': jobs
            })
            return

        # 2. API: Government Recruitments & Exams
        if path == '/api/govt-jobs':
            category = query.get('category', [None])[0]
            qualification = query.get('qualification', [None])[0]
            search = query.get('search', [None])[0]
            source = query.get('source', [None])[0]
            organization = query.get('organization', [None])[0]
            is_demo_param = query.get('isDemo', [None])[0]
            
            # Pure real records by default. Never mix demo with live.
            is_demo = False
            if is_demo_param is not None:
                if is_demo_param.lower() in ('true', '1'):
                    is_demo = True
                elif is_demo_param.lower() == 'all':
                    is_demo = None

            recruitments = Database.get_govt_recruitments(
                category=category,
                qualification=qualification,
                search=search,
                source=source,
                organization=organization,
                is_demo=is_demo
            )

            # Auto-seed from live portals if database has 0 real govt recruitments
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

            # Compute most recent updated timestamp
            latest_updated = None
            for r in recruitments:
                f_time = r.get('fetchedAt') or r.get('updatedAt')
                if f_time and f_time != 'Not available':
                    if not latest_updated or str(f_time) > str(latest_updated):
                        latest_updated = str(f_time)
            if not latest_updated:
                from datetime import datetime, timezone
                latest_updated = datetime.now(timezone.utc).isoformat()

            source_status = 'Operational' if len(recruitments) > 0 else 'Source unavailable'
            real_count = len(recruitments) if not is_demo else 0

            self._send_json(200, {
                'success': True,
                'source': 'Verified Official Central & State Government Portals (UPSC, Railway Recruitment Boards, India Post GDS, National Career Service)',
                'sourceStatus': source_status,
                'lastUpdated': latest_updated,
                'realRecordsReturned': real_count,
                'count': len(recruitments),
                'recruitments': recruitments
            })
            return

        # 3. API: Notifications list
        if path == '/api/notifications':
            category = query.get('category', [None])[0]
            source = query.get('source', [None])[0]
            status = query.get('status', [None])[0]
            search = query.get('search', [None])[0]
            sort = query.get('sort', ['newest'])[0]
            is_demo_param = query.get('isDemo', [None])[0]

            is_demo = False
            if is_demo_param is not None:
                if is_demo_param.lower() in ('true', '1'):
                    is_demo = True
                elif is_demo_param.lower() == 'all':
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
                from datetime import datetime, timezone
                latest_updated = datetime.now(timezone.utc).isoformat()

            source_status = 'Operational' if len(notifs) > 0 else 'Source unavailable'
            real_count = len(notifs) if not is_demo else 0

            self._send_json(200, {
                'success': True,
                'source': 'Union Public Service Commission (UPSC)',
                'sourceStatus': source_status,
                'lastUpdated': latest_updated,
                'realNotificationsReturned': real_count,
                'count': len(notifs),
                'notifications': notifs
            })
            return

        # 3b. API: Real Internships
        if path == '/api/internships':
            category = query.get('category', [None])[0]
            location = query.get('location', [None])[0]
            work_type = query.get('workType', [None])[0]
            stipend_type = query.get('stipendType', [None])[0]
            search = query.get('search', [None])[0]
            is_demo_param = query.get('isDemo', [None])[0]
            
            is_demo = False
            if is_demo_param is not None:
                if is_demo_param.lower() in ('true', '1'):
                    is_demo = True
                elif is_demo_param.lower() == 'all':
                    is_demo = None

            internships = Database.get_internships(
                category=category,
                location=location,
                work_type=work_type,
                stipend_type=stipend_type,
                search=search,
                is_demo=is_demo
            )

            # Auto-seed if database has 0 real internships
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
                        work_type=work_type,
                        stipend_type=stipend_type,
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

            self._send_json(200, {
                'success': True,
                'source': 'Verified Authentic Internship Portals (The Muse Public API, Amazon Jobs India, Arbeitnow Feeds)',
                'sourceStatus': source_status,
                'lastUpdated': latest_updated,
                'realRecordsReturned': real_count,
                'count': len(internships),
                'internships': internships
            })
            return

        # 3c. API: Enterprise Tech Companies Directory (Always visible with live status)
        if path == '/api/companies':
            companies = Database.get_companies_status()
            latest_updated = _now_iso()
            for c in companies:
                lu = c.get('lastChecked')
                if lu and lu != 'Not available':
                    if str(lu) > str(latest_updated):
                        latest_updated = str(lu)

            self._send_json(200, {
                'success': True,
                'source': 'Verified Official Enterprise Career Portals (TCS, Infosys, Wipro, Accenture, Cognizant, IBM, Microsoft, Amazon, Google, Capgemini, Deloitte, HCLTech, Tech Mahindra)',
                'sourceStatus': 'Operational',
                'lastUpdated': latest_updated,
                'count': len(companies),
                'companies': companies
            })
            return

        # 3d. API: Eligibility Matching Engine (GET)
        if path == '/api/eligibility/match':
            criteria = {
                'highestQualification': query.get('highestQualification', [None])[0] or query.get('qualification', [None])[0],
                'degree': query.get('degree', [None])[0],
                'graduationStatus': query.get('graduationStatus', [None])[0],
                'graduationYear': query.get('graduationYear', [None])[0],
                'experience': query.get('experience', [None])[0],
                'skills': [s.strip() for s in query.get('skills', [''])[0].split(',') if s.strip()],
                'preferredLocation': query.get('preferredLocation', [None])[0],
                'preferredJobType': query.get('preferredJobType', [None])[0],
                'careerPreference': query.get('careerPreference', ['Both Corporate & Government'])[0]
            }
            results = Database.match_eligibility(criteria)
            self._send_json(200, {
                'success': True,
                **results
            })
            return

        # 4. API: Configured sources
        if path == '/api/sources':
            sources = Storage.get_sources()
            self._send_json(200, {
                'success': True,
                'count': len(sources),
                'sources': sources
            })
            return

        # 5. API: Admin stats
        if path == '/api/admin/stats':
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
            self._send_json(200, {
                'success': True,
                'stats': combined_stats
            })
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Real Data Ingestion Sync: /api/sync/run
        if path == '/api/sync/run':
            result = execute_live_data_sync()
            self._send_json(200, {
                'success': True,
                **result
            })
            return

        # Corporate Real Data Sync: /api/sync/corporate
        if path == '/api/sync/corporate':
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
            self._send_json(200, {
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
            })
            return

        # Government Real Data Sync: /api/sync/govt
        if path == '/api/sync/govt':
            upsc_notices, upsc_err = UPSCLiveAdapter.fetch_live_announcements()
            rrb_notices, rrb_err = RRBLiveAdapter.fetch_live_notices()
            gds_notices, gds_err = IndiaPostGDSAdapter.fetch_live_notices()
            ncs_notices, ncs_err = NCSLiveAdapter.fetch_live_updates()

            all_govt = upsc_notices + rrb_notices + gds_notices + ncs_notices
            valid_g, new_g, dup_g = ingest_govt_notices(all_govt)
            now_iso = _now_iso()

            errs = [e for e in [upsc_err, rrb_err, gds_err, ncs_err] if e]
            updated_jobs = Database.get_govt_recruitments(is_demo=False)
            self._send_json(200, {
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
            })
            return

        # Real Internships Sync: /api/sync/internships
        if path == '/api/sync/internships':
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
            self._send_json(200, {
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
            })
            return

        # API: Trigger source checker
        if path == '/api/sources/check':
            report = NotificationCheckerService.check_all_sources()
            self._send_json(200, {
                'success': True,
                'report': report
            })
            return

        # API: Mark all notifications read
        if path == '/api/notifications/mark-all-read':
            count = Storage.mark_all_read()
            self._send_json(200, {
                'success': True,
                'markedCount': count
            })
            return

        # API: Mark single notification read/unread
        if path.startswith('/api/notifications/') and path.endswith('/read'):
            parts = path.strip('/').split('/')
            if len(parts) == 4:
                notif_id = parts[2]
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length) if content_length > 0 else b'{}'
                try:
                    payload = json.loads(body.decode('utf-8'))
                except Exception:
                    payload = {}
                read_state = payload.get('read', True)
                ok = Storage.mark_notification_read(notif_id, read_state)
                self._send_json(200 if ok else 404, {
                    'success': ok,
                    'id': notif_id,
                    'read': read_state
                })
                return

        # API: Real Eligibility Matching Engine (POST)
        if path == '/api/eligibility/match':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b'{}'
            try:
                criteria = json.loads(body.decode('utf-8'))
            except Exception:
                criteria = {}
            results = Database.match_eligibility(criteria)
            self._send_json(200, {
                'success': True,
                **results
            })
            return

        self._send_json(404, {'error': 'Endpoint not found'})

def run(port=PORT):
    # Start periodic background ingestion worker
    scheduler.start(execute_live_data_sync)

    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, CareerSphereHandler)
    print(f"\n=======================================================")
    print(f" CareerSphere Unified Server & Live Job Ingestion API")
    print(f" Website URL : http://localhost:{port}")
    print(f" API Endpoints:")
    print(f"   - GET  /api/corporate-jobs")
    print(f"   - GET  /api/govt-jobs")
    print(f"   - GET  /api/notifications")
    print(f"   - POST /api/sync/run")
    print(f"   - GET  /api/admin/stats")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        scheduler.stop()
        httpd.server_close()

if __name__ == '__main__':
    run()
