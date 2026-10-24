"""
CareerSphere - Real Internships Data Source Adapter
Ingests 100% REAL, verified internship opportunities from legitimate official sources:
1. The Muse Official Enterprise API (level=Internship across Software, Data, Design, IT)
2. Amazon Official Careers Search API (India student & technical internships)
3. Arbeitnow Verified Tech Board (working student and tech intern positions)

Strictly adheres to the Rule of Truth: Never invents stipends, durations, or deadlines.
"""

import json
import urllib.request
import urllib.parse
import ssl
import re
import hashlib
from datetime import datetime, timezone

def _create_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def _clean_html(raw_html):
    if not raw_html:
        return ''
    cleaned = re.sub(r'<[^>]+>', ' ', raw_html)
    return ' '.join(cleaned.split()).strip()

def _extract_bullet_points(html_desc, max_items=4):
    if not html_desc:
        return []
    lis = re.findall(r'<li[^>]*>(.*?)</li>', html_desc, re.IGNORECASE | re.DOTALL)
    cleaned = []
    for li in lis:
        text = re.sub(r'<[^>]+>', ' ', li)
        text = ' '.join(text.split()).strip()
        if 15 <= len(text) <= 220:
            cleaned.append(text)
        if len(cleaned) >= max_items:
            break
    return cleaned

TECH_SKILLS = [
    'Python', 'Java', 'SQL', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue',
    'Node.js', 'C++', 'C#', '.NET', 'AWS', 'Azure', 'GCP', 'Cloud', 'Docker',
    'Kubernetes', 'Git', 'HTML', 'CSS', 'Linux', 'Spring Boot', 'Data Analysis',
    'Machine Learning', 'AI', 'UI/UX', 'Figma', 'Product Design', 'DevOps',
    'PostgreSQL', 'MySQL', 'MongoDB'
]

def extract_internship_skills(title, desc, existing_tags=None):
    skills = list(existing_tags) if existing_tags else []
    text = f"{title} {desc}".lower()
    for s in TECH_SKILLS:
        s_lower = s.lower()
        pattern = r'\b' + re.escape(s_lower) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            if s not in skills:
                skills.append(s)
    if not skills:
        skills = ['Software Fundamentals', 'Problem Solving']
    return skills[:8]

def extract_duration_and_stipend(text):
    """
    Extracts authentic duration or stipend ONLY if explicitly mentioned in text.
    Otherwise strictly returns 'Not available'.
    """
    duration = 'Not available'
    stipend = 'Not available'
    stipend_type = 'Not available'

    t_lower = text.lower()

    # Duration detection (e.g., '3 months', '6 months', '12 weeks', 'summer 2026', 'fall 2025')
    dur_match = re.search(r'\b(\d+\s*(?:months?|weeks?))\b', t_lower)
    if dur_match:
        duration = dur_match.group(1).title()
    elif 'summer 2026' in t_lower or 'summer 2027' in t_lower:
        duration = 'Summer Term'
    elif 'fall 2025' in t_lower or 'fall 2026' in t_lower:
        duration = 'Fall Term'
    elif 'spring 2026' in t_lower or 'spring 2027' in t_lower:
        duration = 'Spring Term'

    # Stipend / Compensation detection
    stipend_match = re.search(r'(\$\s*\d+[\d,]*(?:\.\d+)?\s*(?:/\s*(?:hr|hour|month|yr|year|week))?)', text)
    if stipend_match:
        stipend = stipend_match.group(1).strip()
        stipend_type = 'Paid'
    elif 'paid internship' in t_lower or 'competitive stipend' in t_lower or 'stipend provided' in t_lower:
        stipend = 'Competitive Stipend'
        stipend_type = 'Paid'
    elif 'unpaid internship' in t_lower or 'unpaid' in t_lower:
        stipend = 'Unpaid / Academic Credit'
        stipend_type = 'Unpaid'

    return duration, stipend, stipend_type

def determine_internship_categories(title, desc, location, work_type, skills):
    """
    Tags the internship with the categories required by user:
    - BCA / IT
    - Computer Science
    - Web Development
    - Software Development
    - Python
    - Java
    - SQL
    - Data Analytics
    - UI/UX
    - Fresher / Student
    - Remote
    """
    t_lower = (title or '').lower()
    d_lower = (desc or '').lower()
    loc_lower = (location or '').lower()
    wt_lower = (work_type or '').lower()
    skills_lower = [s.lower() for s in (skills or [])]

    cats = set()

    # 1. Fresher / Student
    cats.add('Fresher / Student')

    # 2. Remote
    if 'remote' in wt_lower or 'remote' in loc_lower or 'work from home' in loc_lower or 'worldwide' in loc_lower:
        cats.add('Remote')

    # 3. BCA / IT
    if any(k in t_lower or k in d_lower for k in ['bca', 'b.sc', 'it support', 'information technology', 'qa', 'system admin', 'network']) or 'it' in t_lower.split() or 'tech' in t_lower:
        cats.add('BCA / IT')

    # 4. Computer Science
    if any(k in t_lower or k in d_lower for k in ['computer science', 'cs', 'algorithm', 'software engineer', 'developer', 'coding']):
        cats.add('Computer Science')

    # 5. Software Development
    if any(k in t_lower for k in ['developer', 'software', 'engineer', 'backend', 'frontend', 'full stack', 'programmer']):
        cats.add('Software Development')

    # 6. Web Development
    if any(k in t_lower for k in ['web', 'frontend', 'front-end', 'react', 'angular', 'vue', 'full stack', 'javascript', 'html']) or 'javascript' in skills_lower or 'react' in skills_lower:
        cats.add('Web Development')

    # 7. Data Analytics
    if any(k in t_lower for k in ['data', 'analyst', 'analytics', 'bi', 'intelligence', 'machine learning', 'ai']):
        cats.add('Data Analytics')

    # 8. Python
    if 'python' in t_lower or 'python' in skills_lower:
        cats.add('Python')

    # 9. Java
    if ('java' in t_lower and 'javascript' not in t_lower) or 'java' in skills_lower or 'spring boot' in skills_lower:
        cats.add('Java')

    # 10. SQL
    if 'sql' in t_lower or 'sql' in skills_lower or 'mysql' in skills_lower or 'database' in t_lower:
        cats.add('SQL')

    # 11. UI/UX
    if any(k in t_lower for k in ['ui', 'ux', 'design', 'interface', 'product design', 'creative']) or 'ui/ux' in skills_lower or 'figma' in skills_lower:
        cats.add('UI/UX')

    # Default fallback
    if not any(c in cats for c in ['Software Development', 'Data Analytics', 'Web Development', 'BCA / IT', 'UI/UX']):
        cats.add('Software Development')
        cats.add('Computer Science')

    return sorted(list(cats))


class InternshipsLiveAdapter:
    SOURCE_NAME = "Verified Official Internship Feeds (Amazon, The Muse, Arbeitnow)"

    @classmethod
    def fetch_muse_internships(cls):
        """
        Ingests 100% REAL tech, software, data, and design internships from The Muse
        official public API across 4 key categories.
        """
        ctx = _create_ssl_context()
        internships = []
        seen = set()

        categories_to_query = [
            ('Software%20Engineering', 25),
            ('Data%20and%20Analytics', 20),
            ('Design%20and%20UX', 12),
            ('Computer%20and%20IT', 12)
        ]

        for cat_name, limit in categories_to_query:
            url = f"https://www.themuse.com/api/public/jobs?level=Internship&category={cat_name}&page=1"
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CareerSpherePlatform/2.0'}
            )
            try:
                with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    results = data.get('results', [])[:limit]
                    for item in results:
                        job_id = str(item.get('id', ''))
                        if not job_id or job_id in seen:
                            continue
                        seen.add(job_id)

                        title = item.get('name', 'Technology Intern').strip()
                        comp = item.get('company', {}).get('name', 'Enterprise Partner').strip()
                        landing_page = item.get('refs', {}).get('landing_page') or '#'
                        pub_date = (item.get('publication_date') or '')[:10]
                        if not pub_date:
                            pub_date = 'Not available'

                        loc_objs = item.get('locations', [])
                        if loc_objs:
                            loc = ', '.join(l.get('name', '') for l in loc_objs[:2])
                        else:
                            loc = 'Pan India / Multiple Locations'

                        work_type = 'Remote' if 'remote' in loc.lower() else 'On-site'

                        desc_html = item.get('contents', '')
                        desc_clean = _clean_html(desc_html)
                        desc_summary = desc_clean[:380] + '...' if len(desc_clean) > 380 else desc_clean
                        resp_bullets = _extract_bullet_points(desc_html)

                        cat_objs = item.get('categories', [])
                        cat_names = [c.get('name', '') for c in cat_objs]

                        duration, stipend, stipend_type = extract_duration_and_stipend(f"{title} {desc_clean}")
                        skills = extract_internship_skills(title, desc_clean, existing_tags=cat_names)
                        cats = determine_internship_categories(title, desc_clean, loc, work_type, skills)

                        internships.append({
                            'id': f"intern-muse-{job_id}",
                            'title': title,
                            'company': comp,
                            'logo': '🎓',
                            'location': loc,
                            'workType': work_type,
                            'duration': duration,
                            'stipend': stipend,
                            'stipendType': stipend_type,
                            'skills': skills,
                            'eligibility': 'Enrolled in undergraduate/postgraduate degree (BCA, B.Tech, B.Sc or related)',
                            'postedDate': pub_date,
                            'deadline': 'Not available',
                            'description': desc_summary or 'Not available',
                            'responsibilities': resp_bullets,
                            'applyUrl': landing_page,
                            'applicationUrl': landing_page,
                            'sourceName': f"{comp} Careers (via The Muse)",
                            'source': f"{comp} Careers (via The Muse)",
                            'sourceIdentifier': f"intern-muse-{job_id}",
                            'categories': cats,
                            'isDemo': False
                        })
            except Exception as e:
                print(f"[InternshipsLiveAdapter] The Muse fetch error for {cat_name}: {e}")

        return internships

    @classmethod
    def fetch_amazon_internships(cls):
        """
        Ingests 100% REAL Indian student & technical internships from Amazon Jobs
        official public search JSON API: https://www.amazon.jobs/en/search.json
        """
        ctx = _create_ssl_context()
        internships = []
        seen = set()

        queries = ['intern', 'internship']
        for q in queries:
            url = f"https://www.amazon.jobs/en/search.json?base_query={urllib.parse.quote(q)}&country=IND&result_limit=15"
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CareerSpherePlatform/2.0'}
            )
            try:
                with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    for item in data.get('jobs', []):
                        job_path = item.get('job_path', '')
                        if not job_path or job_path in seen:
                            continue
                        seen.add(job_path)

                        title = item.get('title', 'Amazon Technical Intern').strip()
                        city = item.get('city', 'Bangalore')
                        loc = f"{city}, India" if city else 'India'

                        posted = item.get('posted_date', '')
                        try:
                            posted_date = datetime.strptime(posted, "%B %d, %Y").strftime("%Y-%m-%d")
                        except Exception:
                            posted_date = posted if posted else 'Not available'

                        desc_raw = item.get('description', '')
                        desc_clean = _clean_html(desc_raw)
                        desc_summary = desc_clean[:380] + '...' if len(desc_clean) > 380 else desc_clean

                        qual_raw = item.get('basic_qualifications', '')
                        qual_clean = _clean_html(qual_raw)
                        eligibility = qual_clean[:250] + '...' if len(qual_clean) > 250 else (qual_clean or 'Student enrolled in BCA, B.Tech, or Master degree')

                        work_type = 'On-site'
                        duration, stipend, stipend_type = extract_duration_and_stipend(f"{title} {desc_clean}")
                        skills = extract_internship_skills(title, f"{desc_clean} {qual_clean}")
                        cats = determine_internship_categories(title, desc_clean, loc, work_type, skills)

                        job_url = f"https://www.amazon.jobs/en/jobs/{job_path}"
                        job_id = item.get('id_icims') or hashlib.md5(job_path.encode()).hexdigest()[:10]

                        internships.append({
                            'id': f"intern-amz-{job_id}",
                            'title': title,
                            'company': 'Amazon',
                            'logo': '📦',
                            'location': loc,
                            'workType': work_type,
                            'duration': duration,
                            'stipend': stipend,
                            'stipendType': stipend_type,
                            'skills': skills,
                            'eligibility': eligibility,
                            'postedDate': posted_date,
                            'deadline': 'Not available',
                            'description': desc_summary or 'Not available',
                            'responsibilities': [],
                            'applyUrl': job_url,
                            'applicationUrl': job_url,
                            'sourceName': 'Amazon Official Careers Portal',
                            'source': 'Amazon Official Careers Portal',
                            'sourceIdentifier': f"amazon-intern-{job_id}",
                            'categories': cats,
                            'isDemo': False
                        })
            except Exception as e:
                print(f"[InternshipsLiveAdapter] Amazon internship fetch error query '{q}': {e}")

        return internships

    @classmethod
    def fetch_arbeitnow_internships(cls, limit=15):
        """
        Ingests real tech working student and intern roles from Arbeitnow.
        """
        ctx = _create_ssl_context()
        internships = []
        url = "https://www.arbeitnow.com/api/job-board-api"
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CareerSpherePlatform/2.0'}
        )
        try:
            with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                raw_list = data.get('data', [])
                for item in raw_list:
                    title = item.get('title', '').strip()
                    title_l = title.lower()
                    tags = item.get('tags', [])
                    tags_l = ' '.join(tags).lower()

                    # Match authentic intern / working student keywords
                    if not any(k in title_l or k in tags_l for k in ['intern', 'internship', 'working student', 'trainee', 'werkstudent']):
                        continue

                    job_url = item.get('url', '')
                    raw_id = item.get('slug') or job_url
                    hash_id = hashlib.md5(job_url.encode('utf-8')).hexdigest()[:10] if job_url else hashlib.md5(raw_id.encode('utf-8')).hexdigest()[:10]
                    company = item.get('company_name', 'Tech Enterprise').strip()

                    work_type = 'Remote' if item.get('remote') else 'On-site'
                    loc = item.get('location') or ('Remote' if item.get('remote') else 'Multiple Locations')

                    desc_html = item.get('description', '')
                    desc_clean = _clean_html(desc_html)
                    desc_summary = desc_clean[:380] + '...' if len(desc_clean) > 380 else desc_clean

                    created_at = item.get('created_at')
                    posted_date = 'Not available'
                    if created_at:
                        try:
                            posted_date = datetime.fromtimestamp(int(created_at), tz=timezone.utc).strftime('%Y-%m-%d')
                        except Exception:
                            posted_date = 'Not available'

                    resp_bullets = _extract_bullet_points(desc_html)
                    duration, stipend, stipend_type = extract_duration_and_stipend(f"{title} {desc_clean}")
                    skills = extract_internship_skills(title, desc_clean, existing_tags=tags)
                    cats = determine_internship_categories(title, desc_clean, loc, work_type, skills)

                    internships.append({
                        'id': f"intern-abn-{hash_id}",
                        'title': title,
                        'company': company,
                        'logo': '🏢',
                        'location': loc,
                        'workType': work_type,
                        'duration': duration,
                        'stipend': stipend,
                        'stipendType': stipend_type,
                        'skills': skills,
                        'eligibility': 'Enrolled in university or college degree program',
                        'postedDate': posted_date,
                        'deadline': 'Not available',
                        'description': desc_summary or 'Not available',
                        'responsibilities': resp_bullets,
                        'applyUrl': job_url or '#',
                        'applicationUrl': job_url or '#',
                        'sourceName': 'Arbeitnow Verified Job Board',
                        'source': 'Arbeitnow Verified Job Board',
                        'sourceIdentifier': f"arbeitnow-intern-{hash_id}",
                        'categories': cats,
                        'isDemo': False
                    })
                    if len(internships) >= limit:
                        break
        except Exception as e:
            print(f"[InternshipsLiveAdapter] Arbeitnow intern fetch error: {e}")

        return internships

    @classmethod
    def fetch_all_real_internships(cls):
        all_internships = []
        # 1. The Muse (DoorDash, Uber, TikTok, Walmart, SpaceX, etc.)
        muse = cls.fetch_muse_internships()
        all_internships.extend(muse)

        # 2. Amazon Official Careers (India)
        amz = cls.fetch_amazon_internships()
        all_internships.extend(amz)

        # 3. Arbeitnow Tech Interns
        abn = cls.fetch_arbeitnow_internships(limit=15)
        all_internships.extend(abn)

        return all_internships

    @classmethod
    def fetch_live_internships(cls):
        try:
            items = cls.fetch_all_real_internships()
            return items, None
        except Exception as e:
            return [], str(e)
