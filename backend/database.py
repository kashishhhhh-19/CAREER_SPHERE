"""
CareerSphere Database Manager
Powered by Python built-in sqlite3.
Handles persistence, indexing, duplicate prevention, and transactional queries
for Corporate Jobs, Government Recruitments, Notifications, and Source Health.
"""

import os
import re
import json
import sqlite3
import threading
import hashlib
from datetime import datetime, timezone

from backend.config import DATABASE_URL

if DATABASE_URL and DATABASE_URL.startswith('sqlite:///'):
    DB_FILE = os.path.abspath(DATABASE_URL.replace('sqlite:///', '', 1))
    DB_DIR = os.path.dirname(DB_FILE)
else:
    DB_DIR = os.path.join(os.path.dirname(__file__), 'data')
    DB_FILE = os.path.join(DB_DIR, 'careersphere.db')

_lock = threading.RLock()

def _now_iso():
    return datetime.now(timezone.utc).isoformat()

def get_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with _lock:
        conn = get_connection()
        c = conn.cursor()

        # 1. Corporate Jobs & Internships
        c.execute("""
        CREATE TABLE IF NOT EXISTS corporate_jobs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            logo TEXT DEFAULT '🏢',
            category TEXT DEFAULT 'Software Developer',
            role_category TEXT DEFAULT 'Fresher Jobs',
            work_type TEXT DEFAULT 'Full-time',
            location TEXT DEFAULT 'Pan India',
            experience TEXT DEFAULT 'Fresher (0-1 yr)',
            salary TEXT DEFAULT 'Competitive / Best in Industry',
            eligibility TEXT,
            deadline TEXT,
            posted_date TEXT,
            skills TEXT,
            description TEXT,
            responsibilities TEXT,
            selection_process TEXT,
            apply_url TEXT NOT NULL,
            source_name TEXT,
            source_identifier TEXT UNIQUE,
            is_demo INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT
        )
        """)

        # Dynamic migration check for corporate_jobs
        c.execute("PRAGMA table_info(corporate_jobs)")
        existing_corp_cols = [r['name'] for r in c.fetchall()]
        if 'categories' not in existing_corp_cols:
            c.execute("ALTER TABLE corporate_jobs ADD COLUMN categories TEXT DEFAULT '[]'")

        # 2. Government Recruitments & Exams
        c.execute("""
        CREATE TABLE IF NOT EXISTS govt_recruitments (
            id TEXT PRIMARY KEY,
            post_name TEXT NOT NULL,
            organization TEXT NOT NULL,
            department TEXT DEFAULT 'Not available',
            category TEXT DEFAULT 'Government Jobs',
            qualification TEXT DEFAULT 'Not available',
            qualification_detail TEXT DEFAULT 'Not available',
            eligibility TEXT DEFAULT 'Not available',
            location TEXT DEFAULT 'All India',
            vacancies TEXT DEFAULT 'Not available',
            age_limit TEXT DEFAULT 'Not available',
            application_fee TEXT DEFAULT 'Not available',
            start_date TEXT DEFAULT 'Not available',
            last_date TEXT DEFAULT 'Not available',
            exam_date TEXT DEFAULT 'Not available',
            status TEXT DEFAULT 'Open',
            salary_pay_scale TEXT DEFAULT 'Not available',
            description TEXT,
            posts_included TEXT DEFAULT 'Not available',
            selection_stages TEXT DEFAULT 'Not available',
            syllabus_overview TEXT DEFAULT 'Not available',
            apply_url TEXT NOT NULL,
            official_pdf_url TEXT,
            source_name TEXT,
            source_identifier TEXT UNIQUE,
            is_demo INTEGER DEFAULT 0,
            fetched_at TEXT,
            created_at TEXT,
            updated_at TEXT
        )
        """)

        # Dynamic migration check for columns added in Phase 1
        c.execute("PRAGMA table_info(govt_recruitments)")
        existing_govt_cols = [r['name'] for r in c.fetchall()]
        if 'department' not in existing_govt_cols:
            c.execute("ALTER TABLE govt_recruitments ADD COLUMN department TEXT DEFAULT 'Not available'")
        if 'eligibility' not in existing_govt_cols:
            c.execute("ALTER TABLE govt_recruitments ADD COLUMN eligibility TEXT DEFAULT 'Not available'")
        if 'fetched_at' not in existing_govt_cols:
            c.execute("ALTER TABLE govt_recruitments ADD COLUMN fetched_at TEXT")

        # 3. Cross-Cutting Notifications Table
        c.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            organization TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            source_name TEXT,
            source_url TEXT,
            notification_date TEXT,
            application_start_date TEXT,
            application_last_date TEXT,
            eligibility TEXT,
            qualification TEXT,
            location TEXT,
            vacancies TEXT,
            apply_url TEXT,
            official_notification_url TEXT,
            status TEXT DEFAULT 'Active',
            is_new INTEGER DEFAULT 1,
            is_read INTEGER DEFAULT 0,
            is_demo INTEGER DEFAULT 0,
            source_identifier TEXT UNIQUE,
            first_discovered_at TEXT,
            created_at TEXT,
            updated_at TEXT
        )
        """)

        # 4. Sources Health Registry Table
        c.execute("""
        CREATE TABLE IF NOT EXISTS sources_health (
            id TEXT PRIMARY KEY,
            source_name TEXT NOT NULL,
            source_type TEXT NOT NULL,
            category TEXT NOT NULL,
            portal_url TEXT NOT NULL,
            enabled INTEGER DEFAULT 1,
            status TEXT DEFAULT 'Operational',
            items_count INTEGER DEFAULT 0,
            last_checked_time TEXT,
            last_successful_check TEXT,
            error_status TEXT
        )
        """)

        # 5. Internships Table
        c.execute("""
        CREATE TABLE IF NOT EXISTS internships (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            logo TEXT DEFAULT '🎓',
            location TEXT DEFAULT 'Not available',
            work_type TEXT DEFAULT 'On-site',
            duration TEXT DEFAULT 'Not available',
            stipend TEXT DEFAULT 'Not available',
            stipend_type TEXT DEFAULT 'Not available',
            skills TEXT DEFAULT '[]',
            eligibility TEXT DEFAULT 'Not available',
            posted_date TEXT DEFAULT 'Not available',
            deadline TEXT DEFAULT 'Not available',
            description TEXT,
            responsibilities TEXT DEFAULT '[]',
            apply_url TEXT NOT NULL,
            source_name TEXT NOT NULL,
            source_identifier TEXT UNIQUE,
            categories TEXT DEFAULT '[]',
            is_demo INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT
        )
        """)

        # 6. Users Table
        c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            avatar TEXT DEFAULT '👤',
            role TEXT DEFAULT 'candidate',
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)
        c.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")

        # 7. User Profiles Table
        c.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id TEXT PRIMARY KEY,
            phone TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            highest_qualification TEXT DEFAULT "Graduate (Bachelor's)",
            degree TEXT DEFAULT '',
            graduation_status TEXT DEFAULT 'Pursuing (Final Year)',
            graduation_year TEXT DEFAULT '2025',
            skills TEXT DEFAULT '[]',
            experience TEXT DEFAULT 'Fresher (0-1 yr)',
            preferred_locations TEXT DEFAULT '[]',
            preferred_sectors TEXT DEFAULT '["Corporate", "Government", "Internships"]',
            preferred_job_type TEXT DEFAULT 'Full-time / Internship',
            career_preference TEXT DEFAULT 'Both Corporate & Government',
            work_preference TEXT DEFAULT 'Hybrid / Flexible',
            resume_data TEXT DEFAULT '{}',
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)

        # 8. User Saved Opportunities Table (User-isolated)
        c.execute("""
        CREATE TABLE IF NOT EXISTS user_saved_opportunities (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            opportunity_id TEXT NOT NULL,
            opportunity_type TEXT NOT NULL,
            title TEXT NOT NULL,
            organization TEXT NOT NULL,
            category TEXT DEFAULT '',
            location TEXT DEFAULT 'Pan India',
            deadline TEXT DEFAULT 'Not available',
            salary TEXT DEFAULT '',
            apply_url TEXT NOT NULL,
            source_name TEXT DEFAULT '',
            is_demo INTEGER DEFAULT 0,
            saved_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, opportunity_id)
        )
        """)
        c.execute("CREATE INDEX IF NOT EXISTS idx_saved_user ON user_saved_opportunities(user_id)")

        # 9. User Eligibility Preferences Table
        c.execute("""
        CREATE TABLE IF NOT EXISTS user_eligibility_preferences (
            user_id TEXT PRIMARY KEY,
            highest_qualification TEXT DEFAULT "Graduate (Bachelor's)",
            degree TEXT DEFAULT '',
            graduation_status TEXT DEFAULT 'Pursuing (Final Year)',
            graduation_year TEXT DEFAULT '2025',
            skills TEXT DEFAULT '[]',
            experience TEXT DEFAULT 'Fresher (0-1 yr)',
            preferred_location TEXT DEFAULT 'All India',
            preferred_job_type TEXT DEFAULT 'Full-time / Internship',
            career_preference TEXT DEFAULT 'Both Corporate & Government',
            work_preference TEXT DEFAULT 'Hybrid / Flexible',
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)

        # 10. User Notification Read Status Table
        c.execute("""
        CREATE TABLE IF NOT EXISTS user_notification_reads (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            notification_id TEXT NOT NULL,
            read_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, notification_id)
        )
        """)
        c.execute("CREATE INDEX IF NOT EXISTS idx_notif_reads_user ON user_notification_reads(user_id)")

        conn.commit()
        conn.close()

# Ensure DB initialized on module import
init_db()

class Database:
    init_db = staticmethod(init_db)

    @staticmethod
    def upsert_corporate_job(job_data):
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            now = _now_iso()
            source_id = job_data.get('sourceIdentifier') or job_data.get('source_identifier') or job_data.get('id')
            clean_src_id = str(source_id or job_data.get('title', ''))
            job_id = job_data.get('id') or f"corp-{hashlib.md5(clean_src_id.encode('utf-8')).hexdigest()[:10]}"

            # Check duplicate by source_identifier or id
            c.execute("SELECT id, is_demo FROM corporate_jobs WHERE source_identifier = ? OR id = ?", (source_id, job_id))
            existing = c.fetchone()

            skills_json = json.dumps(job_data.get('skills', [])) if isinstance(job_data.get('skills'), list) else (job_data.get('skills') or '[]')
            resp_json = json.dumps(job_data.get('responsibilities', [])) if isinstance(job_data.get('responsibilities'), list) else (job_data.get('responsibilities') or '[]')
            cats_json = json.dumps(job_data.get('categories', [])) if isinstance(job_data.get('categories'), list) else (job_data.get('categories') or '[]')
            is_demo_val = 1 if job_data.get('isDemo') or job_data.get('is_demo') else 0

            if existing:
                matched_id = existing['id']
                c.execute("""
                UPDATE corporate_jobs SET
                    title = ?,
                    company = ?,
                    logo = ?,
                    category = ?,
                    role_category = ?,
                    work_type = ?,
                    location = ?,
                    experience = ?,
                    salary = ?,
                    eligibility = ?,
                    deadline = ?,
                    posted_date = ?,
                    skills = ?,
                    description = ?,
                    responsibilities = ?,
                    selection_process = ?,
                    apply_url = ?,
                    source_name = ?,
                    source_identifier = ?,
                    is_demo = ?,
                    categories = ?,
                    updated_at = ?
                WHERE id = ?
                """, (
                    job_data.get('title'),
                    job_data.get('company'),
                    job_data.get('logo', '🏢'),
                    job_data.get('category', 'Software Developer'),
                    job_data.get('roleCategory', job_data.get('role_category', 'Fresher Jobs')),
                    job_data.get('workType', job_data.get('work_type', 'Full-time')),
                    job_data.get('location', 'Pan India'),
                    job_data.get('experience', 'Fresher (0-1 yr)'),
                    job_data.get('salary', 'Not available'),
                    job_data.get('eligibility', 'Not available'),
                    job_data.get('deadline', 'Not available'),
                    job_data.get('postedDate', job_data.get('posted_date', 'Not available')),
                    skills_json,
                    job_data.get('description', 'Not available'),
                    resp_json,
                    job_data.get('selectionProcess', job_data.get('selection_process', '')),
                    job_data.get('applyUrl', job_data.get('apply_url', '#')),
                    job_data.get('sourceName', job_data.get('source_name', 'Company Careers')),
                    source_id,
                    is_demo_val,
                    cats_json,
                    now,
                    matched_id
                ))
                conn.commit()
                conn.close()
                return matched_id, False
            else:
                c.execute("""
                INSERT INTO corporate_jobs (
                    id, title, company, logo, category, role_category, work_type,
                    location, experience, salary, eligibility, deadline, posted_date,
                    skills, description, responsibilities, selection_process,
                    apply_url, source_name, source_identifier, is_demo, categories, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    job_id,
                    job_data.get('title'),
                    job_data.get('company'),
                    job_data.get('logo', '🏢'),
                    job_data.get('category', 'Software Developer'),
                    job_data.get('roleCategory', job_data.get('role_category', 'Fresher Jobs')),
                    job_data.get('workType', job_data.get('work_type', 'Full-time')),
                    job_data.get('location', 'Pan India'),
                    job_data.get('experience', 'Fresher (0-1 yr)'),
                    job_data.get('salary', 'Not available'),
                    job_data.get('eligibility', 'Not available'),
                    job_data.get('deadline', 'Not available'),
                    job_data.get('postedDate', job_data.get('posted_date', 'Not available')),
                    skills_json,
                    job_data.get('description', 'Not available'),
                    resp_json,
                    job_data.get('selectionProcess', job_data.get('selection_process', '')),
                    job_data.get('applyUrl', job_data.get('apply_url', '#')),
                    job_data.get('sourceName', job_data.get('source_name', 'Company Careers')),
                    source_id,
                    is_demo_val,
                    cats_json,
                    now,
                    now
                ))
                conn.commit()
                conn.close()
                return job_id, True

    @staticmethod
    def get_corporate_jobs(category=None, company=None, role_category=None, experience=None, work_type=None, search=None, is_demo=None):
        conn = get_connection()
        c = conn.cursor()
        query = "SELECT * FROM corporate_jobs WHERE 1=1"
        params = []

        if is_demo is not None:
            query += " AND is_demo = ?"
            params.append(1 if is_demo else 0)

        if category and category != 'All':
            query += " AND (category = ? OR role_category = ? OR categories LIKE ?)"
            params.extend([category, category, f'%"{category}"%'])

        if company and company != 'All':
            query += " AND LOWER(company) LIKE ?"
            params.append(f"%{company.lower().strip()}%")

        if role_category and role_category != 'All':
            query += " AND (role_category = ? OR category = ? OR categories LIKE ?)"
            params.extend([role_category, role_category, f'%"{role_category}"%'])

        if experience and experience != 'All':
            exp_l = experience.lower().strip()
            if 'fresher' in exp_l or 'entry' in exp_l:
                query += " AND (LOWER(experience) LIKE '%fresher%' OR LOWER(experience) LIKE '%entry%' OR LOWER(experience) LIKE '%0-1%' OR LOWER(title) LIKE '%junior%' OR LOWER(title) LIKE '%fresher%' OR LOWER(title) LIKE '%entry%')"
            elif 'senior' in exp_l or 'experienced' in exp_l:
                query += " AND (LOWER(experience) LIKE '%senior%' OR LOWER(experience) LIKE '%experienced%' OR LOWER(experience) LIKE '%lead%' OR LOWER(title) LIKE '%senior%' OR LOWER(title) LIKE '%lead%')"
            elif 'student' in exp_l or 'intern' in exp_l:
                query += " AND (LOWER(experience) LIKE '%intern%' OR LOWER(experience) LIKE '%student%' OR LOWER(title) LIKE '%intern%')"

        if work_type and work_type != 'All':
            wt_l = work_type.lower().strip()
            if 'remote' in wt_l:
                query += " AND (LOWER(work_type) LIKE '%remote%' OR LOWER(location) LIKE '%remote%' OR LOWER(location) LIKE '%worldwide%')"
            else:
                query += " AND LOWER(work_type) LIKE ?"
                params.append(f"%{wt_l}%")

        if search:
            q = f"%{search.lower().strip()}%"
            query += " AND (LOWER(title) LIKE ? OR LOWER(company) LIKE ? OR LOWER(location) LIKE ? OR LOWER(skills) LIKE ? OR LOWER(description) LIKE ?)"
            params.extend([q, q, q, q, q])

        query += " ORDER BY is_demo ASC, created_at DESC"
        c.execute(query, params)
        rows = c.fetchall()
        
        jobs = []
        for r in rows:
            d = dict(r)
            try:
                d['skills'] = json.loads(d['skills']) if d.get('skills') else []
            except Exception:
                d['skills'] = []
            try:
                d['responsibilities'] = json.loads(d['responsibilities']) if d.get('responsibilities') else []
            except Exception:
                d['responsibilities'] = []
            try:
                d['categories'] = json.loads(d['categories']) if d.get('categories') else []
            except Exception:
                d['categories'] = []
            d['isDemo'] = bool(d['is_demo'])
            d['roleCategory'] = d.get('role_category') or 'Tech Opportunity'
            d['workType'] = d.get('work_type') or 'Full-time'
            d['jobType'] = d['workType']
            d['postedDate'] = d.get('posted_date') or 'Not available'
            d['applyUrl'] = d.get('apply_url') or '#'
            d['applicationUrl'] = d['applyUrl']
            d['sourceName'] = d.get('source_name') or 'Verified Corporate Feeds'
            d['source'] = d['sourceName']
            
            # Rule of Truth: Guarantee 'Not available' for any missing fields
            d['title'] = d.get('title') or 'Not available'
            d['company'] = d.get('company') or 'Not available'
            d['location'] = d.get('location') or 'Not available'
            d['experience'] = d.get('experience') or 'Not available'
            d['salary'] = d.get('salary') or 'Not available'
            d['description'] = d.get('description') or 'Not available'
            d['deadline'] = d.get('deadline') or 'Not available'
            d['eligibility'] = d.get('eligibility') or 'Not available'
            jobs.append(d)
        conn.close()
        return jobs

    @staticmethod
    def upsert_govt_recruitment(rec_data):
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            now = _now_iso()
            source_id = rec_data.get('sourceIdentifier') or rec_data.get('source_identifier') or rec_data.get('id')
            rec_id = rec_data.get('id') or f"govt-{hashlib.md5(str(source_id).encode('utf-8')).hexdigest()[:10]}"
            is_demo_val = 1 if rec_data.get('isDemo') or rec_data.get('is_demo') else 0

            post_name = rec_data.get('postName') or rec_data.get('post_name') or rec_data.get('job_title') or 'Not available'
            org = rec_data.get('organization') or rec_data.get('recruiting_organization') or 'Union Public Service Commission (UPSC)'
            dept = rec_data.get('department') or 'Not available'
            cat = rec_data.get('category') or 'Government Jobs'
            qual = rec_data.get('qualification') or 'Not available'
            qual_det = rec_data.get('qualificationDetail') or rec_data.get('qualification_detail') or 'Not available'
            elig = rec_data.get('eligibility') or 'Not available'
            loc = rec_data.get('location') or 'Not available'
            vac = rec_data.get('vacancies') or 'Not available'
            age = rec_data.get('ageLimit') or rec_data.get('age_limit') or rec_data.get('age_information') or 'Not available'
            fee = rec_data.get('applicationFee') or rec_data.get('application_fee') or 'Not available'
            start_d = rec_data.get('startDate') or rec_data.get('start_date') or rec_data.get('application_start_date') or 'Not available'
            last_d = rec_data.get('lastDate') or rec_data.get('last_date') or rec_data.get('application_last_date') or 'Not available'
            exam_d = rec_data.get('examDate') or rec_data.get('exam_date') or 'Not available'
            stat = rec_data.get('status') or 'Open'
            salary = rec_data.get('salaryPayScale') or rec_data.get('salary_pay_scale') or 'Not available'
            desc = rec_data.get('description') or f"Official recruitment notice for {post_name}. Sourced from official portal."
            posts_inc = rec_data.get('postsIncluded') or rec_data.get('posts_included') or post_name
            stages = rec_data.get('selectionStages') or rec_data.get('selection_stages') or 'Not available'
            syllabus = rec_data.get('syllabusOverview') or rec_data.get('syllabus_overview') or 'Not available'
            apply_u = rec_data.get('applyUrl') or rec_data.get('apply_url') or rec_data.get('official_notification_url') or 'https://upsc.gov.in'
            pdf_u = rec_data.get('officialPdfUrl') or rec_data.get('official_pdf_url') or apply_u
            src_name = rec_data.get('sourceName') or rec_data.get('source_name') or 'Union Public Service Commission (UPSC)'
            fetched_at_val = rec_data.get('fetchedAt') or rec_data.get('fetched_at') or rec_data.get('fetched_updated_date') or now

            c.execute("""
                SELECT id FROM govt_recruitments 
                WHERE source_identifier = ? OR id = ? OR (post_name = ? AND organization = ?)
                   OR (official_pdf_url = ? AND official_pdf_url != 'https://upsc.gov.in')
                LIMIT 1
            """, (source_id, rec_id, post_name, org, pdf_u))
            existing = c.fetchone()

            if existing:
                matched_id = existing['id']
                c.execute("""
                UPDATE govt_recruitments SET
                    post_name = ?,
                    organization = ?,
                    department = ?,
                    category = ?,
                    qualification = ?,
                    qualification_detail = ?,
                    eligibility = ?,
                    location = ?,
                    vacancies = ?,
                    age_limit = ?,
                    application_fee = ?,
                    start_date = ?,
                    last_date = ?,
                    exam_date = ?,
                    status = ?,
                    salary_pay_scale = ?,
                    description = ?,
                    posts_included = ?,
                    selection_stages = ?,
                    syllabus_overview = ?,
                    apply_url = ?,
                    official_pdf_url = ?,
                    source_name = ?,
                    source_identifier = ?,
                    is_demo = ?,
                    fetched_at = ?,
                    updated_at = ?
                WHERE id = ?
                """, (
                    post_name, org, dept, cat, qual, qual_det, elig,
                    loc, vac, age, fee, start_d, last_d, exam_d, stat,
                    salary, desc, posts_inc, stages, syllabus,
                    apply_u, pdf_u, src_name, source_id,
                    is_demo_val, fetched_at_val, now, matched_id
                ))
                conn.commit()
                conn.close()
                return matched_id, False
            else:
                c.execute("""
                INSERT INTO govt_recruitments (
                    id, post_name, organization, department, category, qualification,
                    qualification_detail, eligibility, location, vacancies, age_limit, application_fee,
                    start_date, last_date, exam_date, status, salary_pay_scale,
                    description, posts_included, selection_stages, syllabus_overview,
                    apply_url, official_pdf_url, source_name, source_identifier,
                    is_demo, fetched_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    rec_id, post_name, org, dept, cat, qual,
                    qual_det, elig, loc, vac, age, fee,
                    start_d, last_d, exam_d, stat, salary,
                    desc, posts_inc, stages, syllabus,
                    apply_u, pdf_u, src_name, source_id,
                    is_demo_val, fetched_at_val, now, now
                ))
                conn.commit()
                conn.close()
                return rec_id, True

    @staticmethod
    def get_govt_recruitments(category=None, qualification=None, search=None, source=None, organization=None, is_demo=False):
        conn = get_connection()
        c = conn.cursor()
        query = "SELECT * FROM govt_recruitments WHERE 1=1"
        params = []

        if is_demo is not None:
            query += " AND is_demo = ?"
            params.append(1 if is_demo else 0)

        if category and category != 'All':
            query += " AND category = ?"
            params.append(category)

        if qualification and qualification != 'All':
            query += " AND qualification LIKE ?"
            params.append(f"%{qualification}%")

        if source and source != 'All':
            query += " AND (LOWER(source_name) LIKE ? OR LOWER(organization) LIKE ?)"
            s_q = f"%{source.lower().strip()}%"
            params.extend([s_q, s_q])

        if organization and organization != 'All':
            query += " AND LOWER(organization) LIKE ?"
            params.append(f"%{organization.lower().strip()}%")

        if search:
            q = f"%{search.lower().strip()}%"
            query += " AND (LOWER(post_name) LIKE ? OR LOWER(organization) LIKE ? OR LOWER(location) LIKE ? OR LOWER(department) LIKE ? OR LOWER(source_name) LIKE ?)"
            params.extend([q, q, q, q, q])

        query += " ORDER BY is_demo ASC, created_at DESC"
        c.execute(query, params)
        rows = c.fetchall()

        items = []
        for r in rows:
            d = dict(r)
            d['isDemo'] = bool(d['is_demo'])
            d['jobTitle'] = d['post_name']
            d['job_title'] = d['post_name']
            d['postName'] = d['post_name']
            d['recruitingOrganization'] = d['organization']
            d['recruiting_organization'] = d['organization']
            d['department'] = d.get('department') or 'Not available'
            d['location'] = d.get('location') or 'Not available'
            d['qualification'] = d.get('qualification') or 'Not available'
            d['qualificationDetail'] = d.get('qualification_detail') or 'Not available'
            d['eligibility'] = d.get('eligibility') or 'Not available'
            d['ageLimit'] = d.get('age_limit') or 'Not available'
            d['ageInfo'] = d.get('age_limit') or 'Not available'
            d['ageInformation'] = d.get('age_limit') or 'Not available'
            d['age_information'] = d.get('age_limit') or 'Not available'
            d['applicationFee'] = d.get('application_fee') or 'Not available'
            d['startDate'] = d.get('start_date') or 'Not available'
            d['applicationStartDate'] = d.get('start_date') or 'Not available'
            d['application_start_date'] = d.get('start_date') or 'Not available'
            d['lastDate'] = d.get('last_date') or 'Not available'
            d['applicationLastDate'] = d.get('last_date') or 'Not available'
            d['application_last_date'] = d.get('last_date') or 'Not available'
            d['examDate'] = d.get('exam_date') or 'Not available'
            d['salaryPayScale'] = d.get('salary_pay_scale') or 'Not available'
            d['postsIncluded'] = d.get('posts_included') or 'Not available'
            d['selectionStages'] = d.get('selection_stages') or 'Not available'
            d['syllabusOverview'] = d.get('syllabus_overview') or 'Not available'
            d['applyUrl'] = d['apply_url']
            d['officialPdfUrl'] = d.get('official_pdf_url') or d['apply_url']
            d['officialNotificationUrl'] = d.get('official_pdf_url') or d['apply_url']
            d['official_notification_url'] = d.get('official_pdf_url') or d['apply_url']
            d['sourceName'] = d['source_name']
            d['source_name'] = d['source_name']
            d['fetchedAt'] = d.get('fetched_at') or d.get('updated_at') or 'Not available'
            d['fetchedUpdatedDate'] = d.get('fetched_at') or d.get('updated_at') or 'Not available'
            d['fetched_updated_date'] = d.get('fetched_at') or d.get('updated_at') or 'Not available'
            items.append(d)
        conn.close()
        return items

    @staticmethod
    def get_stats():
        conn = get_connection()
        c = conn.cursor()
        
        c.execute("SELECT COUNT(*), SUM(CASE WHEN is_demo = 1 THEN 1 ELSE 0 END), SUM(CASE WHEN is_demo = 0 THEN 1 ELSE 0 END) FROM corporate_jobs")
        corp_row = c.fetchone()
        corp_total = corp_row[0] or 0
        corp_demo = corp_row[1] or 0
        corp_real = corp_row[2] or 0

        c.execute("SELECT COUNT(*), SUM(CASE WHEN is_demo = 1 THEN 1 ELSE 0 END), SUM(CASE WHEN is_demo = 0 THEN 1 ELSE 0 END) FROM govt_recruitments")
        govt_row = c.fetchone()
        govt_total = govt_row[0] or 0
        govt_demo = govt_row[1] or 0
        govt_real = govt_row[2] or 0

        c.execute("SELECT COUNT(*), SUM(CASE WHEN is_demo = 1 THEN 1 ELSE 0 END), SUM(CASE WHEN is_demo = 0 THEN 1 ELSE 0 END) FROM internships")
        intern_row = c.fetchone()
        intern_total = intern_row[0] or 0
        intern_demo = intern_row[1] or 0
        intern_real = intern_row[2] or 0

        conn.close()
        return {
            'corporate': {
                'total': corp_total,
                'demo': corp_demo,
                'real': corp_real
            },
            'govt': {
                'total': govt_total,
                'demo': govt_demo,
                'real': govt_real
            },
            'internships': {
                'total': intern_total,
                'demo': intern_demo,
                'real': intern_real
            }
        }

    @staticmethod
    def upsert_internship(intern_data):
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            now = _now_iso()
            source_id = intern_data.get('sourceIdentifier') or intern_data.get('source_identifier') or intern_data.get('id')
            clean_src_id = str(source_id or intern_data.get('title', ''))
            intern_id = intern_data.get('id') or f"intern-{hashlib.md5(clean_src_id.encode('utf-8')).hexdigest()[:10]}"

            c.execute("SELECT id, is_demo FROM internships WHERE source_identifier = ? OR id = ? OR apply_url = ?",
                      (source_id, intern_id, intern_data.get('applyUrl')))
            existing = c.fetchone()

            skills_json = json.dumps(intern_data.get('skills', [])) if isinstance(intern_data.get('skills'), list) else (intern_data.get('skills') or '[]')
            resp_json = json.dumps(intern_data.get('responsibilities', [])) if isinstance(intern_data.get('responsibilities'), list) else (intern_data.get('responsibilities') or '[]')
            cats_json = json.dumps(intern_data.get('categories', [])) if isinstance(intern_data.get('categories'), list) else (intern_data.get('categories') or '[]')
            is_demo_val = 1 if intern_data.get('isDemo') or intern_data.get('is_demo') else 0

            if existing:
                matched_id = existing['id']
                c.execute("""
                UPDATE internships SET
                    title = ?,
                    company = ?,
                    logo = ?,
                    location = ?,
                    work_type = ?,
                    duration = ?,
                    stipend = ?,
                    stipend_type = ?,
                    skills = ?,
                    eligibility = ?,
                    posted_date = ?,
                    deadline = ?,
                    description = ?,
                    responsibilities = ?,
                    apply_url = ?,
                    source_name = ?,
                    source_identifier = ?,
                    categories = ?,
                    is_demo = ?,
                    updated_at = ?
                WHERE id = ?
                """, (
                    intern_data.get('title'),
                    intern_data.get('company'),
                    intern_data.get('logo', '🎓'),
                    intern_data.get('location', 'Not available'),
                    intern_data.get('workType', intern_data.get('work_type', 'On-site')),
                    intern_data.get('duration', 'Not available'),
                    intern_data.get('stipend', 'Not available'),
                    intern_data.get('stipendType', intern_data.get('stipend_type', 'Not available')),
                    skills_json,
                    intern_data.get('eligibility', 'Not available'),
                    intern_data.get('postedDate', intern_data.get('posted_date', 'Not available')),
                    intern_data.get('deadline', 'Not available'),
                    intern_data.get('description', 'Not available'),
                    resp_json,
                    intern_data.get('applyUrl', intern_data.get('apply_url', '#')),
                    intern_data.get('sourceName', intern_data.get('source_name', 'Company Careers')),
                    source_id,
                    cats_json,
                    is_demo_val,
                    now,
                    matched_id
                ))
                conn.commit()
                conn.close()
                return matched_id, False
            else:
                c.execute("""
                INSERT INTO internships (
                    id, title, company, logo, location, work_type, duration, stipend,
                    stipend_type, skills, eligibility, posted_date, deadline,
                    description, responsibilities, apply_url, source_name, source_identifier,
                    categories, is_demo, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    intern_id,
                    intern_data.get('title'),
                    intern_data.get('company'),
                    intern_data.get('logo', '🎓'),
                    intern_data.get('location', 'Not available'),
                    intern_data.get('workType', intern_data.get('work_type', 'On-site')),
                    intern_data.get('duration', 'Not available'),
                    intern_data.get('stipend', 'Not available'),
                    intern_data.get('stipendType', intern_data.get('stipend_type', 'Not available')),
                    skills_json,
                    intern_data.get('eligibility', 'Not available'),
                    intern_data.get('postedDate', intern_data.get('posted_date', 'Not available')),
                    intern_data.get('deadline', 'Not available'),
                    intern_data.get('description', 'Not available'),
                    resp_json,
                    intern_data.get('applyUrl', intern_data.get('apply_url', '#')),
                    intern_data.get('sourceName', intern_data.get('source_name', 'Company Careers')),
                    source_id,
                    cats_json,
                    is_demo_val,
                    now,
                    now
                ))
                conn.commit()
                conn.close()
                return intern_id, True

    @staticmethod
    def get_internships(category=None, location=None, work_type=None, stipend_type=None, search=None, is_demo=None):
        conn = get_connection()
        c = conn.cursor()
        query = "SELECT * FROM internships WHERE 1=1"
        params = []

        if is_demo is not None:
            query += " AND is_demo = ?"
            params.append(1 if is_demo else 0)

        if category and category != 'All':
            query += " AND (categories LIKE ? OR LOWER(title) LIKE ?)"
            params.extend([f'%"{category}"%', f'%{category.lower()}%'])

        if location and location != 'All':
            loc_l = location.lower().strip()
            if loc_l == 'remote':
                query += " AND (LOWER(work_type) LIKE '%remote%' OR LOWER(location) LIKE '%remote%' OR LOWER(location) LIKE '%worldwide%')"
            else:
                query += " AND LOWER(location) LIKE ?"
                params.append(f"%{loc_l}%")

        if work_type and work_type != 'All':
            wt_l = work_type.lower().strip()
            if wt_l == 'remote':
                query += " AND (LOWER(work_type) LIKE '%remote%' OR LOWER(location) LIKE '%remote%' OR LOWER(location) LIKE '%worldwide%')"
            else:
                query += " AND LOWER(work_type) LIKE ?"
                params.append(f"%{wt_l}%")

        if stipend_type and stipend_type != 'All':
            st_l = stipend_type.lower().strip()
            if 'paid' in st_l and 'unpaid' not in st_l:
                query += " AND (stipend_type = 'Paid' OR (stipend != 'Not available' AND LOWER(stipend) NOT LIKE '%unpaid%'))"
            elif 'unpaid' in st_l:
                query += " AND (stipend_type = 'Unpaid' OR LOWER(stipend) LIKE '%unpaid%')"

        if search:
            q = f"%{search.lower().strip()}%"
            query += " AND (LOWER(title) LIKE ? OR LOWER(company) LIKE ? OR LOWER(location) LIKE ? OR LOWER(skills) LIKE ? OR LOWER(description) LIKE ?)"
            params.extend([q, q, q, q, q])

        query += " ORDER BY is_demo ASC, created_at DESC"
        c.execute(query, params)
        rows = c.fetchall()

        items = []
        for r in rows:
            d = dict(r)
            try:
                d['skills'] = json.loads(d['skills']) if d.get('skills') else []
            except Exception:
                d['skills'] = []
            try:
                d['responsibilities'] = json.loads(d['responsibilities']) if d.get('responsibilities') else []
            except Exception:
                d['responsibilities'] = []
            try:
                d['categories'] = json.loads(d['categories']) if d.get('categories') else []
            except Exception:
                d['categories'] = []
            d['isDemo'] = bool(d['is_demo'])
            d['workType'] = d.get('work_type') or 'On-site'
            d['stipendType'] = d.get('stipend_type') or 'Not available'
            d['postedDate'] = d.get('posted_date') or 'Not available'
            d['applyUrl'] = d.get('apply_url') or '#'
            d['applicationUrl'] = d['applyUrl']
            d['sourceName'] = d.get('source_name') or 'Verified Internship Feeds'
            d['source'] = d['sourceName']
            d['duration'] = d.get('duration') or 'Not available'
            d['stipend'] = d.get('stipend') or 'Not available'
            d['eligibility'] = d.get('eligibility') or 'Not available'
            d['deadline'] = d.get('deadline') or 'Not available'
            d['title'] = d.get('title') or 'Not available'
            d['company'] = d.get('company') or 'Not available'
            d['location'] = d.get('location') or 'Not available'
            d['description'] = d.get('description') or 'Not available'
            items.append(d)
        conn.close()
        return items

    @staticmethod
    def get_companies_status():
        from backend.sources.corporate.companies_registry import ENTERPRISE_COMPANIES, company_matches_aliases
        conn = get_connection()
        c = conn.cursor()

        # Get all real corporate jobs
        c.execute("SELECT company, role_category, category, categories, experience, created_at, updated_at FROM corporate_jobs WHERE is_demo = 0")
        corp_rows = c.fetchall()

        # Get all real internships
        c.execute("SELECT company, categories, created_at, updated_at FROM internships WHERE is_demo = 0")
        intern_rows = c.fetchall()

        # Get source health checked times if available
        c.execute("SELECT last_checked_time FROM sources_health WHERE category = 'Corporate Jobs' ORDER BY last_checked_time DESC LIMIT 1")
        sh_row = c.fetchone()
        general_last_checked = sh_row['last_checked_time'] if sh_row and sh_row['last_checked_time'] else _now_iso()

        conn.close()

        result = []
        for comp in ENTERPRISE_COMPANIES:
            # Match corporate jobs
            matching_jobs = []
            for r in corp_rows:
                c_name = (r['company'] or '').strip()
                if company_matches_aliases(c_name, comp['aliases']):
                    matching_jobs.append(r)

            # Match internships
            matching_internships = []
            for r in intern_rows:
                c_name = (r['company'] or '').strip()
                if company_matches_aliases(c_name, comp['aliases']):
                    matching_internships.append(r)

            # Count fresher opportunities
            fresher_count = 0
            for j in matching_jobs:
                exp = (j['experience'] or '').lower()
                rc = (j['role_category'] or '').lower()
                cats = (j['categories'] or '').lower()
                if 'fresher' in exp or '0-1' in exp or 'entry' in exp or 'fresher' in rc or 'fresher' in cats:
                    fresher_count += 1

            jobs_count = len(matching_jobs)
            internships_count = len(matching_internships)

            # Determine dynamic status based on verified opportunities
            if jobs_count > 0:
                if fresher_count > 0 and fresher_count >= (jobs_count // 2):
                    status = "Fresher Hiring"
                else:
                    status = "Hiring Now"
            elif internships_count > 0:
                status = "Internship Available"
            else:
                status = "No Current Matching Opportunity"

            # Determine last checked timestamp
            company_last_checked = None
            for item in matching_jobs + matching_internships:
                ts = item['updated_at'] or item['created_at']
                if ts and ts != 'Not available':
                    if not company_last_checked or str(ts) > str(company_last_checked):
                        company_last_checked = str(ts)

            if not company_last_checked:
                company_last_checked = general_last_checked

            result.append({
                **comp,
                "status": status,
                "activeJobsCount": jobs_count,
                "activeInternshipsCount": internships_count,
                "fresherJobsCount": fresher_count,
                "totalOpportunities": jobs_count + internships_count,
                "hasInternships": internships_count > 0,
                "hasFresher": fresher_count > 0,
                "lastChecked": company_last_checked
            })

        return result

    @staticmethod
    def match_eligibility(criteria=None):
        """
        Server-side eligibility matcher evaluating corporate jobs, internships, and govt recruitments
        strictly against actual requirements in source data according to CareerSphere eligibility rules.
        """
        c = criteria or {}
        user_skills = [s.strip().lower() for s in (c.get('skills') if isinstance(c.get('skills'), list) else (c.get('skills') or '').split(',')) if s.strip()]
        user_degree = (c.get('degree') or '').lower().strip()
        user_pref = c.get('careerPreference') or 'Both Corporate & Government'
        user_location = (c.get('preferredLocation') or '').lower().strip()
        user_job_type = (c.get('preferredJobType') or 'Full-time / Internship').strip()
        user_exp = (c.get('experience') or '').lower().strip()
        user_grad_status = (c.get('graduationStatus') or '').lower().strip()
        is_fresher = 'fresher' in user_exp or '0-1' in user_exp
        is_experienced = '1-2' in user_exp or 'experienced' in user_exp or '2+' in user_exp
        is_student = 'student' in user_exp or 'intern' in user_exp or 'pursuing' in user_grad_status
        user_highest_qual = (c.get('highestQualification') or '').lower().strip()

        is_bca = 'bca' in user_degree or 'computer application' in user_degree
        is_cs_it = is_bca or 'computer science' in user_degree or 'information technology' in user_degree or 'cs' in user_degree or 'it' in user_degree
        is_grad = 'graduate' in user_highest_qual or 'bachelor' in user_highest_qual or len(user_degree) > 0
        is_10th12th_only = ('10th' in user_highest_qual or '12th' in user_highest_qual) and not is_grad

        now_dt = datetime.now(timezone.utc)
        today_str = now_dt.strftime('%Y-%m-%d')

        eligible = []
        possibly_eligible = []
        not_eligible = []

        def check_opp(item, is_govt=False, is_intern=False):
            match_reasons = []
            missing_reasons = []
            unmet_reasons = []
            not_enough_info = False

            # 1. Strict Expiry & Closed Vacancy Filter
            raw_deadline = item.get('last_date' if is_govt else 'deadline') or item.get('lastDate')
            status_val = (item.get('status') or '').lower().strip()
            if status_val in ('closed', 'expired'):
                return None

            if raw_deadline and raw_deadline != 'Not available' and not str(raw_deadline).startswith('Refer to') and raw_deadline != 'Not Specified':
                d_clean = str(raw_deadline).strip()
                if len(d_clean) >= 10 and d_clean[:10] < today_str and d_clean[:4].isdigit():
                    return None

            title_str = (item.get('post_name') if is_govt else item.get('title') or '').lower()
            exam_d = (item.get('exam_date') or item.get('examDate') or '').lower()
            if ('2025' in title_str or '2024' in title_str or '2023' in title_str or '2025' in exam_d or '2024' in exam_d) and (not raw_deadline or raw_deadline == 'Not available' or str(raw_deadline)[:10] < today_str):
                return None

            # Fields for text analysis
            exp_field = ((item.get('experience') or '') + ' ' + (item.get('role_category') or '')).lower()
            elig_field = (item.get('eligibility') or '').lower()
            qual_field = ((item.get('qualification') or '') + ' ' + (item.get('qualification_detail') or '')).lower()
            desc_field = (item.get('description') or '').lower()
            full_txt = f"{title_str} {exp_field} {elig_field} {qual_field} {desc_field}"

            req_years = 0
            m = re.search(r'(\d+)\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+(?:professional|relevant|software|non-internship)?\s*experience|\s*exp)?', full_txt)
            if m:
                try:
                    req_years = int(m.group(1))
                except Exception:
                    req_years = 0

            is_senior_role = any(k in title_str for k in ['senior', 'lead ', 'principal', 'manager', 'director', 'architect', 'head of']) or \
                             any(k in exp_field for k in ['experienced / senior', 'experienced (2+ yrs)', 'mid level', 'mid-level', 'senior'])

            # 2. Experience Requirements & Conflicts
            if is_govt:
                if req_years >= 2 and (is_fresher or is_student):
                    unmet_reasons.append(f"Government post requires {req_years}+ years of prior experience")
                elif req_years >= 3 and is_experienced:
                    unmet_reasons.append(f"Government post requires senior experience ({req_years}+ years)")
                else:
                    match_reasons.append("Experience requirement: Open recruitment / examination without mandatory prior experience requirement")
            elif is_fresher or is_student:
                if req_years >= 2:
                    unmet_reasons.append(f"Job requires {req_years}+ years of experience; user profile shows fresher (0-1 yr)")
                elif is_senior_role:
                    unmet_reasons.append("Role is targeted at mid/senior level professionals; not open to freshers")
                elif any(k in exp_field for k in ['fresher', '0-1', 'entry level', 'graduate trainee']) or \
                     any(k in title_str for k in ['junior', 'fresher', 'trainee', 'intern']) or \
                     'fresher' in elig_field:
                    match_reasons.append("Fresher requirement matches: Source explicitly specifies entry-level / fresher eligibility")
                elif is_intern:
                    match_reasons.append("Role matches student / internship applicant profile")
                elif 'not specified' in exp_field or not item.get('experience'):
                    missing_reasons.append("Experience requirement is not specified in employer posting; verify on portal")
                    not_enough_info = True
            elif is_experienced:
                if req_years >= 3 or is_senior_role:
                    unmet_reasons.append(f"Job requires senior experience ({req_years}+ yrs); user profile indicates 1-2 years")
                elif req_years >= 1 or '1-2' in exp_field or 'experienced' in exp_field or 'fresher' in exp_field:
                    match_reasons.append("Experience requirement matches: Open to candidates with 1-2 years relevant experience")
                elif 'not specified' in exp_field or not item.get('experience'):
                    missing_reasons.append("Experience requirement is not specified in employer posting; verify on portal")
                    not_enough_info = True

            # Internships requiring non-internship experience
            if is_intern and req_years >= 2:
                unmet_reasons.append(f"Posting mandates {req_years}+ years of non-internship experience; not open to entry-level interns")

            # 3. Graduation Status & Year
            if 'pursuing' in user_grad_status:
                if is_intern:
                    match_reasons.append("Student enrollment matches: Opportunity is structured for currently enrolled / pursuing students")
                elif 'degree completed' in full_txt or 'must have passed' in full_txt or 'passout only' in full_txt or 'graduated before' in full_txt:
                    unmet_reasons.append(f"Role mandates a completed degree; profile indicates currently pursuing ({c.get('graduationStatus') or 'pursuing'})")

            # 4. Educational & Degree Qualification Matching
            raw_elig = item.get('qualification_detail' if is_govt else 'eligibility') or item.get('qualification') or item.get('eligibility')
            has_real_elig = raw_elig and raw_elig != 'Not available' and raw_elig != 'Not Specified' and not str(raw_elig).startswith('Refer to') and len(str(raw_elig).strip()) > 3

            disqualifiers = [
                ('mbbs', 'MBBS / Medical Degree'),
                ('medical officer', 'Medical Degree'),
                ('drugs inspector', 'Pharmacy / Pharmaceutical Science Degree'),
                ('b.v.sc', 'Veterinary Science Degree'),
                ('chartered accountant', 'Chartered Accountant (CA)'),
                ('law degree', 'Law Degree (LLB)'),
                ('llb', 'Law Degree (LLB)'),
                ('ph.d', 'Doctoral / Ph.D Degree'),
                ('(phd)', 'Doctoral / Ph.D Degree')
            ]

            for key, label in disqualifiers:
                if key in title_str or key in qual_field or key in elig_field:
                    if not any(key in s for s in user_skills) and key not in user_degree:
                        unmet_reasons.append(f"Requires specialized credential ({label}) not held in user profile")
                        break

            # Degree Level Disqualification for 10th/12th only
            if is_10th12th_only and ('degree' in qual_field or 'graduate' in qual_field or 'bachelor' in qual_field or is_bca):
                if '10th' not in qual_field and '12th' not in qual_field:
                    unmet_reasons.append("Requires recognized Bachelor degree; candidate holds 10th/12th secondary qualification")

            # Positive Qualification Matching
            if has_real_elig:
                raw_lower = str(raw_elig).lower()
                if is_bca and ('bca' in raw_lower or 'computer application' in raw_lower or 'bca' in full_txt):
                    match_reasons.append("Qualification matches: Explicitly matches your BCA / Computer Applications degree")
                elif is_cs_it and any(k in raw_lower for k in ['computer science', 'information technology', 'cs/it', 'software engineering', 'b.sc', 'b.tech', 'btech']):
                    match_reasons.append("Qualification matches: Computer Science / IT academic specialization satisfied")
                elif is_grad and any(k in raw_lower for k in ['any graduate', 'any degree', 'bachelor', 'graduation in any', 'graduate in any', 'degree from a recognized']):
                    match_reasons.append("Qualification matches: Graduation requirement met (Any Bachelor degree accepted)")
                elif '10th' in raw_lower or 'matriculation' in raw_lower or '12th' in raw_lower:
                    match_reasons.append("Qualification matches: 10th pass / matriculation minimum satisfied by candidate profile")
                elif is_govt and 'degree' in raw_lower and is_grad:
                    match_reasons.append("Qualification matches: Recognized university graduation degree held")
                elif is_intern and any(k in raw_lower for k in ['university', 'college', 'enrolled', 'student']):
                    match_reasons.append("Qualification matches: Current college/university enrollment matches internship criteria")
                else:
                    missing_reasons.append(f"Posting states qualification as '{str(raw_elig)[:50]}...'; confirm specific stream on portal")
                    not_enough_info = True
            else:
                if is_govt:
                    missing_reasons.append("Educational prerequisites not specified in bulletin summary; refer to official portal notice")
                elif is_intern:
                    match_reasons.append("General internship opening: Enrolled students and fresh graduates eligible to apply")
                elif is_10th12th_only:
                    missing_reasons.append("Corporate tech role: Employer degree prerequisite not specified; verify on portal")
                else:
                    match_reasons.append("Educational prerequisites: Open / not restricted in employer posting")
                not_enough_info = True

            # Government Age Limit Check
            if is_govt:
                age_field = str(item.get('age_limit') or item.get('ageLimit') or '').lower()
                if age_field and age_field != 'not available' and not age_field.startswith('refer to'):
                    match_reasons.append(f"Age requirement ({item.get('age_limit') or item.get('ageLimit')}) verified")

            # Location match
            if user_location and user_location not in ('all', 'all india', 'pan india'):
                item_loc = str(item.get('location') or '').lower()
                if user_location in item_loc or 'remote' in item_loc or 'all india' in item_loc or 'pan india' in item_loc:
                    match_reasons.append(f"Location matches your preference: {item.get('location') or 'Remote'}")

            # Preferred Job Type
            if user_job_type == 'Internship Only' and not is_intern:
                missing_reasons.append("Job type notice: Profile specifies 'Internship Only'; this is a full-time position")
                not_enough_info = True
            elif user_job_type == 'Full-time Only' and is_intern:
                unmet_reasons.append("Posting is an internship; user profile preference is 'Full-time Only'")

            # 5. Skills Matching
            item_skills = []
            if isinstance(item.get('skills'), list):
                item_skills = [str(s).lower().strip() for s in item.get('skills')]
            matched_skills = [s for s in user_skills if s and len(s) >= 2 and (s in item_skills or s in title_str or s in desc_field or s in elig_field)]
            if matched_skills:
                match_reasons.append(f"Required technical skills matched: {', '.join([s.capitalize() for s in matched_skills[:4]])}")

            # Foreign Language Requirements
            if 'portuguese' in title_str and 'portuguese' not in user_skills:
                unmet_reasons.append("Requires Portuguese language fluency not present in user profile")
            elif 'chinese speaker' in title_str and 'chinese' not in user_skills:
                unmet_reasons.append("Requires Chinese language fluency not present in user profile")
            elif 'japanese' in title_str and 'japanese' not in user_skills:
                unmet_reasons.append("Requires Japanese language fluency not present in user profile")

            # 6. Strict 3-Tier Classification
            primary_explanation = ""
            if unmet_reasons:
                state = 'not_eligible'
                pu = unmet_reasons[0]
                primary_explanation = f"Not eligible because {pu[:1].lower() + pu[1:]}."
            elif not_enough_info or missing_reasons or not match_reasons:
                state = 'possibly_eligible'
                if not match_reasons:
                    missing_reasons.append("No direct skill or role match confirmed from source text")
                if not missing_reasons:
                    missing_reasons.append("detailed eligibility criteria should be confirmed on the official portal")
                pm = missing_reasons[0]
                primary_explanation = f"Possibly eligible because {pm[:1].lower() + pm[1:]}."
            else:
                state = 'eligible'
                if is_intern:
                    primary_explanation = "Eligible because your academic background matches internship prerequisites and no prior industry experience is required."
                elif is_fresher:
                    primary_explanation = f"Eligible because your qualification matches the required {c.get('degree') or 'degree'} and no prior experience is required."
                else:
                    primary_explanation = "Eligible because your verified qualifications and experience align with the opportunity requirements."

            def _dedup(lst):
                seen = set()
                res = []
                for x in lst:
                    if x not in seen:
                        seen.add(x)
                        res.append(x)
                return res

            res_obj = {
                **item,
                'isGovt': is_govt,
                'isInternship': is_intern,
                'eligibleState': state,
                'primaryExplanation': primary_explanation,
                'notEnoughInfo': bool(not_enough_info or missing_reasons),
                'matchReasons': _dedup(match_reasons),
                'missingReasons': _dedup(missing_reasons),
                'unmetReasons': _dedup(unmet_reasons)
            }
            return res_obj
            return res_obj

        # Query real database items
        corp_items = Database.get_corporate_jobs(is_demo=False)
        intern_items = Database.get_internships(is_demo=False)
        govt_items = Database.get_govt_recruitments(is_demo=False)

        if user_pref != 'Government Exams Only':
            for j in corp_items:
                ev = check_opp(j, False, False)
                if ev:
                    if ev['eligibleState'] == 'eligible': eligible.append(ev)
                    elif ev['eligibleState'] == 'possibly_eligible': possibly_eligible.append(ev)
                    else: not_eligible.append(ev)

            for it in intern_items:
                ev = check_opp(it, False, True)
                if ev:
                    if ev['eligibleState'] == 'eligible': eligible.append(ev)
                    elif ev['eligibleState'] == 'possibly_eligible': possibly_eligible.append(ev)
                    else: not_eligible.append(ev)

        if user_pref != 'Corporate Jobs Only':
            for g in govt_items:
                ev = check_opp(g, True, False)
                if ev:
                    if ev['eligibleState'] == 'eligible': eligible.append(ev)
                    elif ev['eligibleState'] == 'possibly_eligible': possibly_eligible.append(ev)
                    else: not_eligible.append(ev)

        # Deterministic sorting: opportunities with most verified matched criteria first
        eligible.sort(key=lambda x: len(x.get('matchReasons', [])), reverse=True)
        possibly_eligible.sort(key=lambda x: len(x.get('matchReasons', [])), reverse=True)

        return {
            'eligible': eligible,
            'possiblyEligible': possibly_eligible,
            'notEligible': not_eligible,
            'counts': {
                'eligible': len(eligible),
                'possiblyEligible': len(possibly_eligible),
                'notEligible': len(not_eligible),
                'totalMatched': len(eligible) + len(possibly_eligible)
            }
        }

    # ==================== USER AUTHENTICATION & MANAGEMENT ====================
    @staticmethod
    def create_user(email, password_hash, full_name, avatar='👤', role='candidate'):
        """Creates a new user and initializes their default profile and preferences."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            clean_email = email.strip().lower()

            # Check duplicate email
            c.execute("SELECT id FROM users WHERE LOWER(email) = ?", (clean_email,))
            if c.fetchone():
                conn.close()
                return None, "An account with this email already exists."

            import uuid
            user_id = f"user-{uuid.uuid4().hex[:12]}"
            now = _now_iso()

            c.execute("""
            INSERT INTO users (id, email, password_hash, full_name, avatar, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
            """, (user_id, clean_email, password_hash, full_name.strip(), avatar, role, now, now))

            # Initialize profile row
            c.execute("""
            INSERT INTO user_profiles (user_id, phone, bio, highest_qualification, degree, graduation_status, graduation_year, skills, experience, preferred_locations, preferred_sectors, preferred_job_type, career_preference, work_preference, resume_data, updated_at)
            VALUES (?, '', '', "Graduate (Bachelor's)", '', 'Pursuing (Final Year)', '2025', '[]', 'Fresher (0-1 yr)', '[]', '["Corporate", "Government", "Internships"]', 'Full-time / Internship', 'Both Corporate & Government', 'Hybrid / Flexible', '{}', ?)
            """, (user_id, now))

            # Initialize eligibility row
            c.execute("""
            INSERT INTO user_eligibility_preferences (user_id, highest_qualification, degree, graduation_status, graduation_year, skills, experience, preferred_location, preferred_job_type, career_preference, work_preference, updated_at)
            VALUES (?, "Graduate (Bachelor's)", '', 'Pursuing (Final Year)', '2025', '[]', 'Fresher (0-1 yr)', 'All India', 'Full-time / Internship', 'Both Corporate & Government', 'Hybrid / Flexible', ?)
            """, (user_id, now))

            conn.commit()
            conn.close()

            user_obj = {
                'id': user_id,
                'email': clean_email,
                'fullName': full_name.strip(),
                'avatar': avatar,
                'role': role,
                'createdAt': now
            }
            return user_obj, None

    @staticmethod
    def get_user_by_email(email):
        """Fetches a user by email, including password_hash for authentication."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            clean_email = email.strip().lower()
            c.execute("SELECT * FROM users WHERE LOWER(email) = ?", (clean_email,))
            row = c.fetchone()
            conn.close()
            if not row:
                return None
            return {
                'id': row['id'],
                'email': row['email'],
                'passwordHash': row['password_hash'],
                'fullName': row['full_name'],
                'avatar': row['avatar'],
                'role': row['role'],
                'isActive': bool(row['is_active']),
                'createdAt': row['created_at'],
                'updatedAt': row['updated_at']
            }

    @staticmethod
    def get_user_by_id(user_id):
        """Fetches safe user details by ID (without password_hash)."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            c.execute("SELECT id, email, full_name, avatar, role, is_active, created_at, updated_at FROM users WHERE id = ?", (user_id,))
            row = c.fetchone()
            conn.close()
            if not row:
                return None
            return {
                'id': row['id'],
                'email': row['email'],
                'fullName': row['full_name'],
                'avatar': row['avatar'],
                'role': row['role'],
                'isActive': bool(row['is_active']),
                'createdAt': row['created_at'],
                'updatedAt': row['updated_at']
            }

    @staticmethod
    def update_user(user_id, full_name=None, avatar=None):
        """Updates user core details."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            now = _now_iso()
            updates = []
            params = []
            if full_name is not None:
                updates.append("full_name = ?")
                params.append(full_name.strip())
            if avatar is not None:
                updates.append("avatar = ?")
                params.append(avatar.strip())
            if not updates:
                conn.close()
                return Database.get_user_by_id(user_id)
            updates.append("updated_at = ?")
            params.append(now)
            params.append(user_id)
            c.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
            conn.commit()
            conn.close()
            return Database.get_user_by_id(user_id)

    # ==================== USER PROFILES ====================
    @staticmethod
    def get_user_profile(user_id):
        """Fetches the user's detailed academic and career profile."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            c.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
            row = c.fetchone()
            conn.close()
            if not row:
                return {
                    'userId': user_id,
                    'phone': '',
                    'bio': '',
                    'highestQualification': "Graduate (Bachelor's)",
                    'degree': '',
                    'graduationStatus': 'Pursuing (Final Year)',
                    'graduationYear': '2025',
                    'skills': [],
                    'experience': 'Fresher (0-1 yr)',
                    'preferredLocations': [],
                    'preferredSectors': ['Corporate', 'Government', 'Internships'],
                    'preferredJobType': 'Full-time / Internship',
                    'careerPreference': 'Both Corporate & Government',
                    'workPreference': 'Hybrid / Flexible',
                    'resumeData': {}
                }
            
            def _parse_j(val, default):
                if not val: return default
                try: return json.loads(val)
                except: return default

            return {
                'userId': row['user_id'],
                'phone': row['phone'] or '',
                'bio': row['bio'] or '',
                'highestQualification': row['highest_qualification'] or "Graduate (Bachelor's)",
                'degree': row['degree'] or '',
                'graduationStatus': row['graduation_status'] or 'Pursuing (Final Year)',
                'graduationYear': row['graduation_year'] or '2025',
                'skills': _parse_j(row['skills'], []),
                'experience': row['experience'] or 'Fresher (0-1 yr)',
                'preferredLocations': _parse_j(row['preferred_locations'], []),
                'preferredSectors': _parse_j(row['preferred_sectors'], ['Corporate', 'Government', 'Internships']),
                'preferredJobType': row['preferred_job_type'] or 'Full-time / Internship',
                'careerPreference': row['career_preference'] or 'Both Corporate & Government',
                'workPreference': row['work_preference'] or 'Hybrid / Flexible',
                'resumeData': _parse_j(row['resume_data'], {}),
                'updatedAt': row['updated_at']
            }

    @staticmethod
    def upsert_user_profile(user_id, data):
        """Upserts a user's detailed profile."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            now = _now_iso()

            skills_val = json.dumps(data.get('skills', [])) if isinstance(data.get('skills'), (list, tuple)) else str(data.get('skills', '[]'))
            locs_val = json.dumps(data.get('preferredLocations', [])) if isinstance(data.get('preferredLocations'), (list, tuple)) else str(data.get('preferredLocations', '[]'))
            secs_val = json.dumps(data.get('preferredSectors', [])) if isinstance(data.get('preferredSectors'), (list, tuple)) else str(data.get('preferredSectors', '[]'))
            resume_val = json.dumps(data.get('resumeData', {})) if isinstance(data.get('resumeData'), dict) else str(data.get('resumeData', '{}'))

            c.execute("SELECT user_id FROM user_profiles WHERE user_id = ?", (user_id,))
            exists = c.fetchone()
            if exists:
                c.execute("""
                UPDATE user_profiles SET
                    phone = ?,
                    bio = ?,
                    highest_qualification = ?,
                    degree = ?,
                    graduation_status = ?,
                    graduation_year = ?,
                    skills = ?,
                    experience = ?,
                    preferred_locations = ?,
                    preferred_sectors = ?,
                    preferred_job_type = ?,
                    career_preference = ?,
                    work_preference = ?,
                    resume_data = ?,
                    updated_at = ?
                WHERE user_id = ?
                """, (
                    data.get('phone', ''),
                    data.get('bio', ''),
                    data.get('highestQualification', "Graduate (Bachelor's)"),
                    data.get('degree', ''),
                    data.get('graduationStatus', 'Pursuing (Final Year)'),
                    data.get('graduationYear', '2025'),
                    skills_val,
                    data.get('experience', 'Fresher (0-1 yr)'),
                    locs_val,
                    secs_val,
                    data.get('preferredJobType', 'Full-time / Internship'),
                    data.get('careerPreference', 'Both Corporate & Government'),
                    data.get('workPreference', 'Hybrid / Flexible'),
                    resume_val,
                    now,
                    user_id
                ))
            else:
                c.execute("""
                INSERT INTO user_profiles (
                    user_id, phone, bio, highest_qualification, degree,
                    graduation_status, graduation_year, skills, experience,
                    preferred_locations, preferred_sectors, preferred_job_type,
                    career_preference, work_preference, resume_data, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user_id,
                    data.get('phone', ''),
                    data.get('bio', ''),
                    data.get('highestQualification', "Graduate (Bachelor's)"),
                    data.get('degree', ''),
                    data.get('graduationStatus', 'Pursuing (Final Year)'),
                    data.get('graduationYear', '2025'),
                    skills_val,
                    data.get('experience', 'Fresher (0-1 yr)'),
                    locs_val,
                    secs_val,
                    data.get('preferredJobType', 'Full-time / Internship'),
                    data.get('careerPreference', 'Both Corporate & Government'),
                    data.get('workPreference', 'Hybrid / Flexible'),
                    resume_val,
                    now
                ))

            # Also sync to eligibility preferences table
            c.execute("""
            INSERT INTO user_eligibility_preferences (
                user_id, highest_qualification, degree, graduation_status, graduation_year,
                skills, experience, preferred_location, preferred_job_type, career_preference,
                work_preference, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                highest_qualification = excluded.highest_qualification,
                degree = excluded.degree,
                graduation_status = excluded.graduation_status,
                graduation_year = excluded.graduation_year,
                skills = excluded.skills,
                experience = excluded.experience,
                preferred_job_type = excluded.preferred_job_type,
                career_preference = excluded.career_preference,
                work_preference = excluded.work_preference,
                updated_at = excluded.updated_at
            """, (
                user_id,
                data.get('highestQualification', "Graduate (Bachelor's)"),
                data.get('degree', ''),
                data.get('graduationStatus', 'Pursuing (Final Year)'),
                data.get('graduationYear', '2025'),
                skills_val,
                data.get('experience', 'Fresher (0-1 yr)'),
                locs_val,
                data.get('preferredJobType', 'Full-time / Internship'),
                data.get('careerPreference', 'Both Corporate & Government'),
                data.get('workPreference', 'Hybrid / Flexible'),
                now
            ))

            conn.commit()
            conn.close()
            return Database.get_user_profile(user_id)

    # ==================== USER SAVED OPPORTUNITIES (ISOLATED) ====================
    @staticmethod
    def get_user_saved_opportunities(user_id):
        """Fetches all saved opportunities specifically bookmarked by this user."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            c.execute("""
            SELECT * FROM user_saved_opportunities
            WHERE user_id = ?
            ORDER BY saved_at DESC
            """, (user_id,))
            rows = c.fetchall()
            conn.close()
            items = []
            for r in rows:
                items.append({
                    'id': r['opportunity_id'],
                    'type': r['opportunity_type'],
                    'title': r['title'],
                    'organization': r['organization'],
                    'category': r['category'],
                    'location': r['location'],
                    'deadline': r['deadline'],
                    'salary': r['salary'],
                    'applyUrl': r['apply_url'],
                    'sourceName': r['source_name'],
                    'isDemo': bool(r['is_demo']),
                    'savedAt': r['saved_at']
                })
            return items

    @staticmethod
    def save_user_opportunity(user_id, opp_data):
        """Saves a bookmarked opportunity for a user. Guaranteed isolation."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            now = _now_iso()
            opp_id = opp_data.get('id')
            if not opp_id:
                conn.close()
                return None, False

            # Check if already saved by this user
            c.execute("""
            SELECT id FROM user_saved_opportunities
            WHERE user_id = ? AND opportunity_id = ?
            """, (user_id, opp_id))
            existing = c.fetchone()
            if existing:
                conn.close()
                return opp_data, False

            import uuid
            save_id = f"saved-{uuid.uuid4().hex[:12]}"
            c.execute("""
            INSERT INTO user_saved_opportunities (
                id, user_id, opportunity_id, opportunity_type, title,
                organization, category, location, deadline, salary,
                apply_url, source_name, is_demo, saved_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                save_id,
                user_id,
                opp_id,
                opp_data.get('type', 'corporate'),
                opp_data.get('title') or opp_data.get('postName') or 'Saved Opportunity',
                opp_data.get('organization') or opp_data.get('company') or 'Enterprise',
                opp_data.get('category') or opp_data.get('roleCategory') or 'Opportunities',
                opp_data.get('location') or 'Pan India',
                opp_data.get('deadline') or 'Not available',
                opp_data.get('salary') or '',
                opp_data.get('applyUrl') or '#',
                opp_data.get('sourceName') or '',
                1 if opp_data.get('isDemo') else 0,
                now
            ))
            conn.commit()
            conn.close()
            return opp_data, True

    @staticmethod
    def unsave_user_opportunity(user_id, opportunity_id):
        """Removes a saved bookmark for a user. Guarantees user isolation."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            c.execute("""
            DELETE FROM user_saved_opportunities
            WHERE user_id = ? AND opportunity_id = ?
            """, (user_id, opportunity_id))
            deleted = c.rowcount > 0
            conn.commit()
            conn.close()
            return deleted

    @staticmethod
    def is_opportunity_saved_by_user(user_id, opportunity_id):
        """Checks if an opportunity is saved by a specific user."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            c.execute("""
            SELECT id FROM user_saved_opportunities
            WHERE user_id = ? AND opportunity_id = ?
            """, (user_id, opportunity_id))
            row = c.fetchone()
            conn.close()
            return bool(row)

    # ==================== USER ELIGIBILITY PREFERENCES ====================
    @staticmethod
    def get_user_eligibility(user_id):
        """Fetches user eligibility preferences."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            c.execute("SELECT * FROM user_eligibility_preferences WHERE user_id = ?", (user_id,))
            row = c.fetchone()
            conn.close()
            if not row:
                return {
                    'highestQualification': "Graduate (Bachelor's)",
                    'degree': 'Bachelor of Computer Applications (BCA)',
                    'graduationStatus': 'Pursuing (Final Year)',
                    'graduationYear': '2025',
                    'skills': ['Python', 'JavaScript', 'React', 'SQL', 'Data Structures'],
                    'experience': 'Fresher (0-1 yr)',
                    'preferredLocation': 'All India',
                    'preferredJobType': 'Full-time / Internship',
                    'careerPreference': 'Both Corporate & Government'
                }
            def _parse_j(val, default):
                if not val: return default
                try: return json.loads(val)
                except: return default

            return {
                'highestQualification': row['highest_qualification'],
                'degree': row['degree'],
                'graduationStatus': row['graduation_status'],
                'graduationYear': row['graduation_year'],
                'skills': _parse_j(row['skills'], []),
                'experience': row['experience'],
                'preferredLocation': row['preferred_location'],
                'preferredJobType': row['preferred_job_type'],
                'careerPreference': row['career_preference'],
                'workPreference': row['work_preference'],
                'updatedAt': row['updated_at']
            }

    @staticmethod
    def upsert_user_eligibility(user_id, data):
        """Upserts user eligibility preferences."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            now = _now_iso()
            skills_val = json.dumps(data.get('skills', [])) if isinstance(data.get('skills'), (list, tuple)) else str(data.get('skills', '[]'))

            c.execute("""
            INSERT INTO user_eligibility_preferences (
                user_id, highest_qualification, degree, graduation_status,
                graduation_year, skills, experience, preferred_location,
                preferred_job_type, career_preference, work_preference, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                highest_qualification = excluded.highest_qualification,
                degree = excluded.degree,
                graduation_status = excluded.graduation_status,
                graduation_year = excluded.graduation_year,
                skills = excluded.skills,
                experience = excluded.experience,
                preferred_location = excluded.preferred_location,
                preferred_job_type = excluded.preferred_job_type,
                career_preference = excluded.career_preference,
                work_preference = excluded.work_preference,
                updated_at = excluded.updated_at
            """, (
                user_id,
                data.get('highestQualification', "Graduate (Bachelor's)"),
                data.get('degree', ''),
                data.get('graduationStatus', 'Pursuing (Final Year)'),
                data.get('graduationYear', '2025'),
                skills_val,
                data.get('experience', 'Fresher (0-1 yr)'),
                data.get('preferredLocation', 'All India'),
                data.get('preferredJobType', 'Full-time / Internship'),
                data.get('careerPreference', 'Both Corporate & Government'),
                data.get('workPreference', 'Hybrid / Flexible'),
                now
            ))
            conn.commit()
            conn.close()
            return Database.get_user_eligibility(user_id)

    # ==================== USER NOTIFICATION READ STATUS ====================
    @staticmethod
    def mark_user_notification_read(user_id, notification_id):
        """Marks a notification as read specifically for a user."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            now = _now_iso()
            import uuid
            read_id = f"read-{uuid.uuid4().hex[:10]}"
            c.execute("""
            INSERT OR IGNORE INTO user_notification_reads (id, user_id, notification_id, read_at)
            VALUES (?, ?, ?, ?)
            """, (read_id, user_id, notification_id, now))
            conn.commit()
            conn.close()
            return True

    @staticmethod
    def get_user_read_notifications(user_id):
        """Returns list of notification IDs read by user."""
        with _lock:
            conn = get_connection()
            c = conn.cursor()
            c.execute("SELECT notification_id FROM user_notification_reads WHERE user_id = ?", (user_id,))
            rows = c.fetchall()
            conn.close()
            return [r['notification_id'] for r in rows]


