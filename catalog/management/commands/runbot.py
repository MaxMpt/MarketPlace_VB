from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import time

from catalog.notify import set_telegram_webhook


class Command(BaseCommand):
    help = "Держит webhook бота: /start и реакции группы"

    def handle(self, *args, **options):
        if not settings.TELEGRAM_BOT_TOKEN:
            raise CommandError(
                "Задайте TELEGRAM_BOT_TOKEN в файле .env (токен от @BotFather)."
            )
        set_telegram_webhook()
        self.stdout.write(f"Mini App: {settings.MINI_APP_URL}")
        self.stdout.write(f"Группа: {settings.TELEGRAM_GROUP_ID}")
        self.stdout.write("Слушаю чат через webhook. Polling выключен, чтобы не перебить вебхук.")
        while True:
            time.sleep(3600)
            set_telegram_webhook()