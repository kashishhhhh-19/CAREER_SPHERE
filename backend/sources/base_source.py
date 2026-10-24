"""
Base Source Adapter Definition
"""

class BaseSource:
    def __init__(self, source_config):
        self.config = source_config
        self.source_id = source_config.get('id')
        self.source_name = source_config.get('sourceName')
        self.source_url = source_config.get('sourceUrl')
        self.portal_url = source_config.get('portalSectionUrl', self.source_url)

    def fetch_updates(self):
        """
        Subclasses implement this method to safely retrieve recruitment updates.
        Must return a tuple: (list_of_notice_dicts, error_message_or_None)
        """
        raise NotImplementedError("Subclasses must implement fetch_updates")
