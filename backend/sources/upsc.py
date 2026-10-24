"""
UPSC Official Source Adapter
Monitors verified public recruitment announcements and examination notifications
directly from the Union Public Service Commission (https://upsc.gov.in).
Strictly adheres to the Rule of Truth: Never invents missing data.
"""

import hashlib
from datetime import datetime, timezone
from .base_source import BaseSource
from .govt.upsc_live_adapter import UPSCLiveAdapter

class UPSCOfficialSource(BaseSource):
    def fetch_updates(self):
        notices, err = UPSCLiveAdapter.fetch_live_announcements()
        now_iso = datetime.now(timezone.utc).isoformat()
        converted = []

        for n in notices:
            title = n.get('job_title') or n.get('postName') or ''
            if not title:
                continue

            lower_title = title.lower()

            # Normalized Notification Type
            if any(k in lower_title for k in ['written result', 'final result', 'marks of recommended', 'answer key', 'marksheet']):
                notif_type = 'Results'
            elif any(k in lower_title for k in ['admit card', 'e-admit', 'interview schedule', 'summon letter']):
                notif_type = 'Admit Cards'
            elif any(k in lower_title for k in ['exam', 'examination']):
                notif_type = 'Exams'
            elif any(k in lower_title for k in ['recruitment', 'posts', 'advt', 'prosecutor', 'officer', 'scientist', 'assistant']):
                notif_type = 'Recruitment Forms'
            else:
                notif_type = 'Government Jobs'

            slug = hashlib.md5(title.strip().encode('utf-8')).hexdigest()[:10]
            official_url = n.get('official_notification_url') or n.get('officialPdfUrl') or n.get('applyUrl') or 'https://upsc.gov.in'
            fetched_time = n.get('fetched_updated_date') or n.get('fetchedAt') or now_iso

            # Extract published date from URL/slug if present, else Not available
            published_date = 'Not available'

            converted.append({
                'id': f"notif-upsc-{slug}",
                'title': title,
                'organization': 'Union Public Service Commission (UPSC)',
                'department': n.get('department') or 'Not available',
                'notificationType': notif_type,
                'category': notif_type,
                'description': n.get('description') or f"Official notification published by the Union Public Service Commission (UPSC): {title}. Sourced directly from https://upsc.gov.in.",
                'publishedDate': published_date,
                'notificationDate': published_date,
                'applicationStartDate': n.get('application_start_date') or 'Not available',
                'applicationLastDate': n.get('application_last_date') or 'Not available',
                'importantDates': {
                    'applicationStartDate': n.get('application_start_date') or 'Not available',
                    'applicationLastDate': n.get('application_last_date') or 'Not available',
                    'examDate': n.get('examDate') or 'Not available'
                },
                'eligibility': n.get('eligibility') or 'Not available',
                'qualification': n.get('qualification') or 'Not available',
                'location': n.get('location') or 'Not available',
                'vacancies': n.get('vacancies') or 'Not available',
                'officialNotificationUrl': official_url,
                'officialSourceUrl': official_url,
                'applyUrl': n.get('applyUrl') or official_url,
                'sourceName': 'Union Public Service Commission (UPSC)',
                'sourceUrl': 'https://upsc.gov.in',
                'status': n.get('status') or 'Open',
                'isNew': True,
                'isRead': False,
                'isDemo': False,
                'sourceIdentifier': f"upsc-notif-{slug}",
                'fetchedAt': fetched_time,
                'lastUpdated': fetched_time,
                'updatedAt': now_iso,
                'createdAt': now_iso
            })

        return converted, err
