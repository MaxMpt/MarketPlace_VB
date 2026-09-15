import json
import threading
import urllib.parse
import urllib.request

from django.conf import settings


def _bot_api(method: str, payload: dict, timeout: int = 8) -> dict:
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        return {}
    data = urllib.parse.urlencode(payload).encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{token}/{method}", data=data)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except Exception:
        return {}


def send_telegram(chat_id, text: str) -> None:
    if not chat_id or not text:
        return

    def _run():
        _bot_api("sendMessage", {"chat_id": int(chat_id), "text": text[:3500]})

    threading.Thread(target=_run, daemon=True).start()


def send_start_card(chat_id) -> None:
    url = settings.MINI_APP_URL
    markup = json.dumps(
        {"inline_keyboard": [[{"text": "Открыть каталог", "web_app": {"url": url}}]]}
    )
    _bot_api(
        "sendMessage",
        {
            "chat_id": int(chat_id),
            "text": (
                "Добро пожаловать в каталог двора Восточное Бутово 2.\n\n"
                "Услуги соседей и компании рядом с домом. "
                "Отзывы без ленты сообщений.\n\n"
                "Нажмите кнопку, чтобы открыть приложение."
            ),
            "reply_markup": markup,
        },
    )


def set_telegram_webhook() -> None:
    url = (settings.MINI_APP_URL or "").rstrip("/") + "/telegram/webhook/"
    if not url.startswith("https://"):
        return
    _bot_api("setWebhook", {"url": url, "allowed_updates": json.dumps(["message"])}, timeout=10)


def delete_telegram_webhook() -> None:
    _bot_api("deleteWebhook", {"drop_pending_updates": "false"})


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