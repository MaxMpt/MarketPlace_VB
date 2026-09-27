from django.apps import AppConfig
from django.db.backends.signals import connection_created
import os
import sys


def _sqlite_wal(sender, connection, **kwargs):
    if connection.vendor != "sqlite":
        return
    cursor = connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA busy_timeout=30000;")
    cursor.execute("PRAGMA synchronous=NORMAL;")


class CatalogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "catalog"
    verbose_name = "МАРКЕТПЛЕЙС"

    def ready(self):
        connection_created.connect(_sqlite_wal)
        skip = {"migrate", "makemigrations", "collectstatic", "seed", "check"}
        if skip.intersection(sys.argv):
            return
        if os.environ.get("RUN_MAIN") == "false":
            return
        from .notify import set_telegram_webhook

        set_telegram_webhook()
        if "runserver" in sys.argv and os.environ.get("RUN_MAIN") != "true":
            return
        import threading

        threading.Thread(target=_raise_reminders, daemon=True).start()


def _raise_reminders():
    import time

    time.sleep(30)
    while True:
        try:
            from django.utils import timezone

            from .models import MarketItem
            from .notify import notify_can_raise

            now = timezone.now()
            items = MarketItem.objects.alive().select_related("create_user")
            for item in items:
                if not item.can_raise or not item.create_user_id:
                    continue
                opened = item.next_raise_at
                if item.raise_notified_at and item.raise_notified_at >= opened:
                    continue
                notify_can_raise(item.create_user_id, item.name)
                item.raise_notified_at = now
                item.save(update_fields=["raise_notified_at"])
        except Exception as exc:
            print("raise reminders", exc, flush=True)
        time.sleep(3600)