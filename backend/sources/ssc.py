"""
Staff Selection Commission (SSC) Source Adapter
Wired to SSCLiveAdapter.
"""

from .base_source import BaseSource
from .govt.ssc_live_adapter import SSCLiveAdapter

class SSCOfficialSource(BaseSource):
    def fetch_updates(self):
        return SSCLiveAdapter.fetch_live_notices()
