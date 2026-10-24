"""
India Post / Gramin Dak Sevak (GDS) Official Source Adapter
Wired to IndiaPostGDSAdapter for authentic postal recruitment circulars.
"""

from .base_source import BaseSource
from .govt.india_post_adapter import IndiaPostGDSAdapter

class IndiaPostOfficialSource(BaseSource):
    def fetch_updates(self):
        return IndiaPostGDSAdapter.fetch_live_notices()
