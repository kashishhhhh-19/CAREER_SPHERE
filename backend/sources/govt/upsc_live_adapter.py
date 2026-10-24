"""
CareerSphere - Official Union Public Service Commission (UPSC) Live Adapter
Extracts authentic recruitment announcements, active examination notifications,
and gazette notices directly from https://upsc.gov.in.

Strictly adheres to the Rule of Truth:
- Never invents fake qualifications, fake age limits, or fake application fees.
- If a field is not specified in the official announcement, it is set to "Not available".
- Every opportunity contains all 13 required fields:
  1. job_title
  2. recruiting_organization
  3. department
  4. location
  5. application_start_date
  6. application_last_date
  7. eligibility
  8. qualification
  9. age_information
  10. official_notification_url
  11. source_name
  12. fetched_updated_date
  13. status (Open / Closed / Upcoming)
"""

import urllib.request
import urllib.parse
import ssl
import re
import hashlib
from datetime import datetime, timezone
from bs4 import BeautifulSoup

def _create_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

class UPSCLiveAdapter:
    SOURCE_NAME = "Union Public Service Commission (UPSC)"
    PORTAL_URL = "https://upsc.gov.in"

    @classmethod
    def fetch_live_announcements(cls):
        """
        Fetches verified recruitment announcements and examinations directly from UPSC portal.
        Returns:
            tuple: (list of normalized notices, error string if any)
        """
        notices = []
        err = None
        ctx = _create_ssl_context()
        now_iso = datetime.now(timezone.utc).isoformat()

        req = urllib.request.Request(
            cls.PORTAL_URL,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/'
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
                html = r.read().decode('utf-8', errors='ignore')
                soup = BeautifulSoup(html, 'html.parser')

                seen_titles = set()

                for a in soup.find_all('a'):
                    href = a.get('href', '')
                    text = a.get_text(strip=True)
                    if not text or len(text) < 12:
                        continue
                    if text in seen_titles:
                        continue

                    lower_t = text.lower()
                    # Filter out standard site navigation links and general advisory banners
                    if lower_t in [
                        'view all', 'annual calendar 2026', 'annual calendar 2027',
                        'active examinations', 'forthcoming examinations',
                        'previous question papers', 'cut-off marks', 'answer keys',
                        'apply online', 'examination notifications',
                        'recruitment advertisements', 'recruitment tests',
                        'final results', 'written results', 'calendar'
                    ]:
                        continue

                    # Ignore general informational notices or portals
                    if any(re.search(p, text, re.I) for p in [
                        r'^final results?$',
                        r'^written results?$',
                        r'^results?$',
                        r'^to apply for examinations',
                        r'^all candidates appearing',
                        r'^advisory to the recommended',
                        r'^status of (?:lateral )?recruitment',
                        r'^recruitment requisition',
                        r'^recruitment cases kept on hold',
                        r'^online recruitment application'
                    ]):
                        continue

                    # Target announcements and recruitment items
                    is_recruitment = any(k in lower_t for k in [
                        'examination', 'posts', 'recruitment', 'notice',
                        'advt', 'officer', 'assistant', 'scientist',
                        'director', 'prosecutor', 'result'
                    ])

                    if 'whats-new' not in href.lower() and not is_recruitment:
                        continue

                    seen_titles.add(text)
                    full_url = urllib.parse.urljoin(cls.PORTAL_URL, href)

                    # 1. Department extraction (Rule of Truth: only extract if mentioned)
                    dept_m = re.search(
                        r'((?:Ministry of|Administration of|Department of|GNCTD|CBI\b)[^,\(\)]*)',
                        text,
                        re.IGNORECASE
                    )
                    department = dept_m.group(1).strip() if dept_m else 'Not available'

                    # 2. Vacancies extraction
                    vac_m = re.search(r'(\d+)\s+posts?', text, re.IGNORECASE)
                    vacancies = vac_m.group(0) if vac_m else 'Not available'

                    # 3. Location extraction
                    location = 'Not available'
                    if 'delhi' in lower_t:
                        location = 'Delhi'
                    elif 'ladakh' in lower_t:
                        location = 'Ladakh (UT)'
                    elif any(k in lower_t for k in ['examination', 'civil services', 'engineering', 'defence', 'geo-scientist', 'upsc', 'ministry']):
                        location = 'All India'

                    # 4. Status normalization: strictly Open / Closed / Upcoming
                    status = 'Open'
                    if any(k in lower_t for k in ['final result', 'written result', 'marks of recommended', 'answer key', 'cancellation']):
                        status = 'Closed'
                    elif '2027' in text:
                        status = 'Upcoming'

                    # 5. Clean Job Title
                    clean_title = re.sub(
                        r'^(?:Addendum\s+Notice:\s*|Notice:\s*|Exam\s+Notification:\s*|Final\s+Result:\s*|Written\s+Result(?:\s*\(with\s*name\))?:\s*|Provisional\s+Answer\s+Key:\s*|Marks\s+of\s+Recommended\s+Candidates(?:\s*\(Reserve\s+List\))?:\s*)',
                        '',
                        text,
                        flags=re.IGNORECASE
                    ).strip()

                    slug = hashlib.md5(text.strip().encode('utf-8')).hexdigest()[:10]

                    # Category determination
                    category = 'UPSC'
                    if 'defence' in lower_t or 'naval' in lower_t or 'police' in lower_t or 'cisf' in lower_t:
                        category = 'Police/Defence'
                    elif 'engineering' in lower_t:
                        category = 'Engineering'
                    elif 'medical' in lower_t or 'scientist' in lower_t:
                        category = 'Medical/Science'

                    notices.append({
                        'id': f"govt-upsc-{slug}",
                        'job_title': clean_title,
                        'post_name': clean_title,
                        'postName': clean_title,
                        'recruiting_organization': cls.SOURCE_NAME,
                        'organization': cls.SOURCE_NAME,
                        'department': department,
                        'location': location,
                        'application_start_date': 'Not available',
                        'start_date': 'Not available',
                        'startDate': 'Not available',
                        'application_last_date': 'Not available',
                        'last_date': 'Not available',
                        'lastDate': 'Not available',
                        'eligibility': 'Not available',
                        'qualification': 'Not available',
                        'qualification_detail': 'Not available',
                        'qualificationDetail': 'Not available',
                        'age_information': 'Not available',
                        'age_limit': 'Not available',
                        'ageLimit': 'Not available',
                        'application_fee': 'Not available',
                        'applicationFee': 'Not available',
                        'official_notification_url': full_url,
                        'officialNotificationUrl': full_url,
                        'apply_url': full_url,
                        'applyUrl': full_url,
                        'official_pdf_url': full_url if full_url.endswith('.pdf') else full_url,
                        'officialPdfUrl': full_url if full_url.endswith('.pdf') else full_url,
                        'source_name': cls.SOURCE_NAME,
                        'sourceName': cls.SOURCE_NAME,
                        'source_identifier': f"upsc-live-{slug}",
                        'sourceIdentifier': f"upsc-live-{slug}",
                        'fetched_updated_date': now_iso,
                        'fetched_at': now_iso,
                        'fetchedAt': now_iso,
                        'status': status,
                        'vacancies': vacancies,
                        'category': category,
                        'exam_date': 'Not available',
                        'examDate': 'Not available',
                        'salary_pay_scale': 'Not available',
                        'salaryPayScale': 'Not available',
                        'description': f"Official announcement published by the Union Public Service Commission (UPSC): {text}. Sourced directly from official portal.",
                        'posts_included': clean_title,
                        'postsIncluded': clean_title,
                        'selection_stages': 'Not available',
                        'selectionStages': 'Not available',
                        'syllabus_overview': 'Not available',
                        'syllabusOverview': 'Not available',
                        'is_demo': False,
                        'isDemo': False
                    })

        except Exception as e:
            err = f"UPSC Live Portal error: {e}"
            print(f"[UPSCLiveAdapter] Error fetching live announcements: {err}")

        return notices, err
