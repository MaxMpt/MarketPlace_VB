from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

from catalog.bot import build_app


class Command(BaseCommand):
    help = "Запускает Telegram-бота: /start открывает Mini App"

    def handle(self, *args, **options):
        if not settings.TELEGRAM_BOT_TOKEN:
            raise CommandError(
                "Задайте TELEGRAM_BOT_TOKEN в файле .env (токен от @BotFather)."
            )
        if settings.MINI_APP_URL.startswith("http://"):
            self.stdout.write(
                self.style.WARNING(
                    "Telegram открывает Mini App только по HTTPS.\n"
                    "Для локальной проверки поднимите ngrok и пропишите MINI_APP_URL в .env."
                )
            )
        self.stdout.write(f"Mini App: {settings.MINI_APP_URL}")
        self.stdout.write("Бот запущен. В Telegram отправьте /start")
        build_app().run_polling(allowed_updates=["message"])