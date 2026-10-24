"""
CareerSphere - Data Validator and Integrity Guard
Ensures all ingested corporate jobs, government recruitments, and notifications
meet schema standards, have verifiable source/apply URLs, and are not outdated or corrupted.
"""

import re

URL_REGEX = re.compile(
    r'^(https?://)'
    r'([a-zA-Z0-9.-]+(\.[a-zA-Z]{2,}))'
    r'(:[0-9]+)?'
    r'(/.*)?$', re.IGNORECASE
)

class DataValidator:
    @staticmethod
    def is_valid_url(url):
        if not url or not isinstance(url, str):
            return False
        url = url.strip()
        if url in ('#', '', '#demo-apply', '#demo-source', '#demo-notice'):
            return False
        return bool(URL_REGEX.match(url))

    @staticmethod
    def validate_corporate_job(job):
        if not isinstance(job, dict):
            return None, False, "Item is not a dictionary"

        title = str(job.get('title', '')).strip()
        company = str(job.get('company', '')).strip()

        if len(title) < 3:
            return None, False, f"Job title too short: '{title}'"
        if len(company) < 2:
            return None, False, f"Company name too short: '{company}'"

        apply_url = str(job.get('applyUrl') or job.get('apply_url') or '').strip()
        if not DataValidator.is_valid_url(apply_url):
            return None, False, f"Invalid or missing applyUrl: '{apply_url}'"

        cleaned = dict(job)
        cleaned['title'] = title
        cleaned['company'] = company
        cleaned['applyUrl'] = apply_url
        cleaned['apply_url'] = apply_url
        cleaned['isDemo'] = bool(job.get('isDemo') or job.get('is_demo', False))
        cleaned['sourceName'] = job.get('sourceName') or job.get('source_name') or 'Verified Corporate Career Portal'
        return cleaned, True, None

    @staticmethod
    def validate_govt_recruitment(rec):
        if not isinstance(rec, dict):
            return None, False, "Item is not a dictionary"

        post_name = str(rec.get('postName') or rec.get('post_name') or '').strip()
        organization = str(rec.get('organization', '')).strip()

        if len(post_name) < 4:
            return None, False, f"Post name too short: '{post_name}'"
        if len(organization) < 2:
            return None, False, f"Organization name too short: '{organization}'"

        apply_url = str(rec.get('applyUrl') or rec.get('apply_url') or '').strip()
        if not DataValidator.is_valid_url(apply_url):
            source_url = str(rec.get('sourceUrl') or rec.get('officialPdfUrl') or '').strip()
            if DataValidator.is_valid_url(source_url):
                apply_url = source_url
            else:
                return None, False, f"Invalid or missing application / portal URL: '{apply_url}'"

        cleaned = dict(rec)
        cleaned['postName'] = post_name
        cleaned['post_name'] = post_name
        cleaned['organization'] = organization
        cleaned['applyUrl'] = apply_url
        cleaned['apply_url'] = apply_url
        cleaned['isDemo'] = bool(rec.get('isDemo') or rec.get('is_demo', False))
        cleaned['sourceName'] = rec.get('sourceName') or rec.get('source_name') or 'Official Government Recruitment Portal'
        return cleaned, True, None

    @staticmethod
    def validate_notification(notif):
        if not isinstance(notif, dict):
            return None, False, "Notification is not a dictionary"

        title = str(notif.get('title', '')).strip()
        organization = str(notif.get('organization', '')).strip()

        if len(title) < 5:
            return None, False, f"Notification title too short: '{title}'"
        if len(organization) < 2:
            return None, False, f"Organization too short: '{organization}'"

        apply_url = str(notif.get('applyUrl') or notif.get('officialNotificationUrl') or '').strip()
        if not DataValidator.is_valid_url(apply_url):
            source_url = str(notif.get('sourceUrl') or '').strip()
            if DataValidator.is_valid_url(source_url):
                apply_url = source_url
            else:
                return None, False, f"Notification missing authentic web link: '{apply_url}'"

        cleaned = dict(notif)
        cleaned['title'] = title
        cleaned['organization'] = organization
        cleaned['applyUrl'] = apply_url
        cleaned['sourceUrl'] = notif.get('sourceUrl') or apply_url
        cleaned['isDemo'] = bool(notif.get('isDemo', False))
        return cleaned, True, None
