"""
Railway Recruitment Boards (RRB) Official Source Adapter
Wired to RRBLiveAdapter for authentic central railway employment notices.
"""

from .base_source import BaseSource
from .govt.rrb_live_adapter import RRBLiveAdapter

class RRBOfficialSource(BaseSource):
    def fetch_updates(self):
        return RRBLiveAdapter.fetch_live_notices()
