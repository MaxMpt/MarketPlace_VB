import threading
import urllib.parse
import urllib.request

from django.conf import settings


def send_telegram(chat_id, text: str) -> None:
    token = settings.TELEGRAM_BOT_TOKEN
    if not token or not chat_id or not text:
        return
    data = urllib.parse.urlencode(
        {"chat_id": int(chat_id), "text": text[:3500]}
    ).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=data,
    )

    def _run():
        try:
            urllib.request.urlopen(req, timeout=6)
        except Exception:
            pass

    threading.Thread(target=_run, daemon=True).start()


def is_admin(user) -> bool:
    if not user:
        return False
    return int(user.id) in settings.ADMIN_IDS


def notify_admins(text: str) -> None:
    for admin_id in settings.ADMIN_IDS:
        send_telegram(admin_id, text)


def login_of(user) -> str:
    if not user:
        return "неизвестный"
    if user.username:
        return f"@{user.username}"
    return user.display_name


def stars_word(n: int) -> str:
    n = int(n)
    if n % 10 == 1 and n % 100 != 11:
        return f"{n} звезду"
    if n % 10 in {2, 3, 4} and n % 100 not in {12, 13, 14}:
        return f"{n} звезды"
    return f"{n} звёзд"
