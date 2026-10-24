"""
CareerSphere - Official Notification Checker Service
Checks enabled sources without inventing fake data.
Reports 'Live source not connected yet' when live scraper integration is pending.
"""

from datetime import datetime, timezone
from ..storage import Storage
from ..sources.upsc import UPSCOfficialSource
from ..sources.ncs import NCSOfficialSource
from ..sources.employment_news import EmploymentNewsOfficialSource
from ..sources.rrb import RRBOfficialSource
from ..sources.india_post import IndiaPostOfficialSource
from ..sources.ssc import SSCOfficialSource
from ..sources.state_govt import StateGovtOfficialSource

SOURCE_ADAPTERS = {
    'src-upsc': UPSCOfficialSource,
    'src-ncs': NCSOfficialSource,
    'src-employment-news': EmploymentNewsOfficialSource,
    'src-rrb': RRBOfficialSource,
    'src-indiapost-gds': IndiaPostOfficialSource,
    'src-ssc': SSCOfficialSource,
    'src-state-psc': StateGovtOfficialSource
}

class NotificationCheckerService:
    @staticmethod
    def check_all_sources():
        sources = Storage.get_sources()
        results = {
            'checkedAt': datetime.now(timezone.utc).isoformat(),
            'totalSources': len(sources),
            'checkedSourcesCount': 0,
            'newImported': 0,
            'duplicatesUpdated': 0,
            'errors': []
        }

        for source in sources:
            if not source.get('enabled'):
                continue

            results['checkedSourcesCount'] += 1
            source_id = source.get('id')
            adapter_cls = SOURCE_ADAPTERS.get(source_id)

            check_time = datetime.now(timezone.utc).isoformat()
            if not adapter_cls:
                err_msg = "Adapter connector pending configuration"
                results['errors'].append({'source': source.get('sourceName'), 'error': err_msg})
                Storage.update_source(source_id, {
                    'lastCheckedTime': check_time,
                    'status': 'Pending configuration',
                    'errorStatus': err_msg
                })
                continue

            try:
                adapter = adapter_cls(source)
                notices, err = adapter.fetch_updates()
                
                source_imported = 0
                source_duplicates = 0

                for notice in notices:
                    _, is_new = Storage.upsert_notification(notice)
                    if is_new:
                        source_imported += 1
                        results['newImported'] += 1
                    else:
                        source_duplicates += 1
                        results['duplicatesUpdated'] += 1

                source_updates = {
                    'lastCheckedTime': check_time,
                    'status': 'Source unavailable' if (err and not notices) else 'Operational',
                    'errorStatus': err if err else None,
                    'itemsCount': len(notices)
                }
                if notices:
                    source_updates['lastSuccessfulCheck'] = check_time

                Storage.update_source(source_id, source_updates)

                if err:
                    results['errors'].append({'source': source.get('sourceName'), 'error': err})

            except Exception as e:
                err_msg = f"Connection error: {str(e)}"
                results['errors'].append({'source': source.get('sourceName'), 'error': err_msg})
                Storage.update_source(source_id, {
                    'lastCheckedTime': check_time,
                    'status': 'Source unavailable',
                    'errorStatus': err_msg
                })

        return results
