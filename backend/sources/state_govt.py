"""
State Government Recruitment Sources Adapter
Wired to StateGovtRecruitmentAdapter.
"""

from .base_source import BaseSource
from .govt.state_govt_adapter import StateGovtRecruitmentAdapter

class StateGovtOfficialSource(BaseSource):
    def __init__(self, source_config=None):
        super().__init__(source_config or {
            'id': 'src-state-psc',
            'sourceName': 'State Public Service Commissions (UKPSC / OSSC)',
            'sourceUrl': 'https://psc.uk.gov.in'
        })

    def fetch_updates(self):
        return StateGovtRecruitmentAdapter.fetch_live_notices()
