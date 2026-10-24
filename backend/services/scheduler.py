"""
CareerSphere - Background Update Scheduler Service
Runs periodic non-blocking ingestion checks for corporate jobs,
government recruitments, and official notifications in a daemon thread.
"""

import threading
import time
from datetime import datetime, timezone

class IngestionScheduler:
    def __init__(self, interval_seconds=14400):  # Default: every 4 hours
        self.interval_seconds = interval_seconds
        self._thread = None
        self._stop_event = threading.Event()
        self.last_run_time = None
        self.last_run_stats = None

    def start(self, sync_callback):
        """
        Starts the background ingestion worker thread.
        sync_callback: callable that executes data ingestion and returns stats.
        """
        if self._thread and self._thread.is_alive():
            return

        self._stop_event.clear()

        def _worker():
            print(f"[Scheduler] Background sync worker started (interval: {self.interval_seconds}s)")
            while not self._stop_event.is_set():
                try:
                    print(f"[Scheduler] Triggering scheduled real data sync...")
                    stats = sync_callback()
                    self.last_run_time = datetime.now(timezone.utc).isoformat()
                    self.last_run_stats = stats
                    print(f"[Scheduler] Sync completed successfully at {self.last_run_time}")
                except Exception as e:
                    print(f"[Scheduler] Background sync error: {e}")

                # Wait for interval or until stopped
                self._stop_event.wait(self.interval_seconds)

        self._thread = threading.Thread(target=_worker, daemon=True, name="CareerSphere-IngestionScheduler")
        self._thread.start()

    def stop(self):
        if self._thread:
            self._stop_event.set()
            self._thread.join(timeout=2)
            print("[Scheduler] Background sync worker stopped")
