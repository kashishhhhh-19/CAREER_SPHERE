"""
CareerSphere - Storage Manager
Handles atomic persistence of notifications and configured sources
with duplicate prevention and thread safety.
"""

import os
import json
import threading
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
NOTIFICATIONS_FILE = os.path.join(DATA_DIR, 'notifications.json')
SOURCES_FILE = os.path.join(DATA_DIR, 'sources.json')

_lock = threading.Lock()

def _now_iso():
    return datetime.now(timezone.utc).isoformat()

class Storage:
    @staticmethod
    def get_sources():
        with _lock:
            if not os.path.exists(SOURCES_FILE):
                return []
            try:
                with open(SOURCES_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"[Storage] Error reading sources: {e}")
                return []

    @staticmethod
    def update_source(source_id, updates):
        with _lock:
            sources = []
            if os.path.exists(SOURCES_FILE):
                try:
                    with open(SOURCES_FILE, 'r', encoding='utf-8') as f:
                        sources = json.load(f)
                except Exception:
                    sources = []
            
            updated = False
            for s in sources:
                if s.get('id') == source_id:
                    s.update(updates)
                    updated = True
                    break
            
            if updated:
                tmp_file = SOURCES_FILE + '.tmp'
                with open(tmp_file, 'w', encoding='utf-8') as f:
                    json.dump(sources, f, indent=2)
                os.replace(tmp_file, SOURCES_FILE)
            return updated

    @staticmethod
    def get_notifications(category=None, source=None, status=None, search=None, sort='newest', is_demo=False):
        with _lock:
            if not os.path.exists(NOTIFICATIONS_FILE):
                return []
            try:
                with open(NOTIFICATIONS_FILE, 'r', encoding='utf-8') as f:
                    items = json.load(f)
            except Exception as e:
                print(f"[Storage] Error reading notifications: {e}")
                return []

        # Exclude demo notices by default for live feeds
        if is_demo is not None:
            items = [n for n in items if bool(n.get('isDemo')) == is_demo]

        # Filtering
        if category and category != 'All':
            items = [n for n in items if n.get('category') == category]
        
        if source and source != 'All':
            if source == 'Demo':
                items = [n for n in items if n.get('isDemo')]
            elif source in ('Official', 'Real'):
                items = [n for n in items if not n.get('isDemo')]
            else:
                items = [n for n in items if n.get('sourceName') == source or source.lower() in n.get('sourceName', '').lower()]

        if status == 'unread':
            items = [n for n in items if not n.get('isRead')]
        elif status == 'read':
            items = [n for n in items if n.get('isRead')]
        elif status == 'closing_soon':
            items = [n for n in items if n.get('status') == 'Closing Soon']

        if search:
            q = search.lower().strip()
            items = [
                n for n in items if
                q in n.get('title', '').lower() or
                q in n.get('organization', '').lower() or
                q in n.get('description', '').lower() or
                q in n.get('qualification', '').lower() or
                q in n.get('location', '').lower()
            ]

        # Sorting
        if sort == 'deadline':
            def parse_date(d_str):
                try:
                    return datetime.strptime(d_str, '%Y-%m-%d')
                except Exception:
                    return datetime.max
            items.sort(key=lambda x: parse_date(x.get('applicationLastDate', '9999-12-31')))
        else:
            items.sort(key=lambda x: x.get('notificationDate', '') or x.get('createdAt', ''), reverse=True)

        return items

    @staticmethod
    def upsert_notification(notice_data):
        """
        Duplicate Prevention Engine:
        Matches by sourceIdentifier or officialNotificationUrl.
        If existing notification is found, updates mutable fields and preserves
        firstDiscoveredAt, original id, and isRead status.
        """
        with _lock:
            items = []
            if os.path.exists(NOTIFICATIONS_FILE):
                try:
                    with open(NOTIFICATIONS_FILE, 'r', encoding='utf-8') as f:
                        items = json.load(f)
                except Exception:
                    items = []

            identifier = notice_data.get('sourceIdentifier')
            official_url = notice_data.get('officialNotificationUrl')
            title = notice_data.get('title')
            org = notice_data.get('organization')

            existing_index = -1
            for i, item in enumerate(items):
                if identifier and item.get('sourceIdentifier') == identifier:
                    existing_index = i
                    break
                if official_url and official_url not in ('#', 'https://upsc.gov.in') and item.get('officialNotificationUrl') == official_url:
                    existing_index = i
                    break
                if title and org and item.get('title') == title and item.get('organization') == org:
                    existing_index = i
                    break

            now = _now_iso()
            if existing_index >= 0:
                # Update existing notice (DUPLICATE PREVENTED)
                existing = items[existing_index]
                for field in [
                    'type', 'opportunityId', 'title', 'organization', 'department', 'notificationType', 'category',
                    'description', 'publishedDate', 'notificationDate', 'applicationStartDate',
                    'applicationLastDate', 'importantDates', 'eligibility', 'qualification',
                    'location', 'vacancies', 'applyUrl', 'officialNotificationUrl',
                    'officialSourceUrl', 'sourceName', 'sourceUrl', 'status', 'fetchedAt', 'lastUpdated'
                ]:
                    if field in notice_data:
                        existing[field] = notice_data[field]

                existing['updatedAt'] = now
                existing['isDemo'] = bool(notice_data.get('isDemo', False))
                is_new = False
                result = existing
            else:
                # Create brand new notification
                new_item = dict(notice_data)
                if not new_item.get('id'):
                    new_item['id'] = f"notif-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
                new_item['firstDiscoveredAt'] = now
                new_item['createdAt'] = now
                new_item['updatedAt'] = now
                new_item['isNew'] = True
                new_item['isRead'] = False
                items.insert(0, new_item)
                is_new = True
                result = new_item

            # Save atomically
            tmp_file = NOTIFICATIONS_FILE + '.tmp'
            with open(tmp_file, 'w', encoding='utf-8') as f:
                json.dump(items, f, indent=2)
            os.replace(tmp_file, NOTIFICATIONS_FILE)

            return result, is_new

    @staticmethod
    def mark_notification_read(notif_id, read_state=True):
        with _lock:
            items = []
            if os.path.exists(NOTIFICATIONS_FILE):
                try:
                    with open(NOTIFICATIONS_FILE, 'r', encoding='utf-8') as f:
                        items = json.load(f)
                except Exception:
                    return False
            
            found = False
            for item in items:
                if item.get('id') == notif_id:
                    item['isRead'] = bool(read_state)
                    item['isNew'] = False
                    item['updatedAt'] = _now_iso()
                    found = True
                    break
            
            if found:
                tmp_file = NOTIFICATIONS_FILE + '.tmp'
                with open(tmp_file, 'w', encoding='utf-8') as f:
                    json.dump(items, f, indent=2)
                os.replace(tmp_file, NOTIFICATIONS_FILE)
            return found

    @staticmethod
    def mark_all_read():
        with _lock:
            items = []
            if os.path.exists(NOTIFICATIONS_FILE):
                try:
                    with open(NOTIFICATIONS_FILE, 'r', encoding='utf-8') as f:
                        items = json.load(f)
                except Exception:
                    return 0
            
            now = _now_iso()
            count = 0
            for item in items:
                if not item.get('isRead'):
                    item['isRead'] = True
                    item['isNew'] = False
                    item['updatedAt'] = now
                    count += 1
            
            tmp_file = NOTIFICATIONS_FILE + '.tmp'
            with open(tmp_file, 'w', encoding='utf-8') as f:
                json.dump(items, f, indent=2)
            os.replace(tmp_file, NOTIFICATIONS_FILE)
            return count

    @staticmethod
    def get_stats():
        sources = Storage.get_sources()
        notifications = Storage.get_notifications()
        unread_count = sum(1 for n in notifications if not n.get('isRead'))
        real_count = sum(1 for n in notifications if not n.get('isDemo'))
        demo_count = sum(1 for n in notifications if n.get('isDemo'))

        live_connected = sum(1 for s in sources if s.get('enabled') and s.get('status') == 'Operational')

        return {
            'totalNotifications': len(notifications),
            'unreadCount': unread_count,
            'realNotifications': real_count,
            'demoNotifications': demo_count,
            'sourcesCount': len(sources),
            'enabledSources': sum(1 for s in sources if s.get('enabled')),
            'liveSourcesConnected': live_connected,
            'liveStatus': 'Operational' if live_connected > 0 else 'Source unavailable',
            'sources': sources
        }
