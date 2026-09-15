from django.core.management.base import BaseCommand

from catalog.notify import set_telegram_webhook


class Command(BaseCommand):
    help = "Вешает Telegram webhook на MINI_APP_URL/telegram/webhook/"

    def handle(self, *args, **options):
        set_telegram_webhook()
        self.stdout.write("Webhook обновлён")