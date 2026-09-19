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