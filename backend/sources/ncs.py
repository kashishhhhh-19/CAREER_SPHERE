"""
National Career Service (NCS) Source Adapter
Ministry of Labour & Employment verified government drives and public apprentice programs.
Wired to NCSLiveAdapter for live verified public announcements.
"""

from .base_source import BaseSource
from .govt.ncs_live_adapter import NCSLiveAdapter

class NCSOfficialSource(BaseSource):
    def fetch_updates(self):
        return NCSLiveAdapter.fetch_live_updates()
