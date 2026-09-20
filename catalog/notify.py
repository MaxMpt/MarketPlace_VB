import json
import threading
import urllib.parse
import urllib.request

from django.conf import settings


def _bot_api(method: str, payload: dict | None = None, timeout: int = 8) -> dict:
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        return {}
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = urllib.parse.urlencode(payload or {}).encode() if payload else None
    req = urllib.request.Request(url, data=data)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except Exception as exc:
        print("bot_api", method, exc, flush=True)
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
        {"inline_keyboard": [[{"text": "Открыть МАРКЕТПЛЕЙС", "web_app": {"url": url}}]]}
    )
    result = _bot_api(
        "sendMessage",
        {
            "chat_id": int(chat_id),
            "text": (
                "Добро пожаловать в МАРКЕТПЛЕЙС Восточное Бутово 2.\n\n"
                "Услуги соседей, рекомендации рядом с домом и барахолка. "
                "Отзывы без ленты сообщений.\n\n"
                "Нажмите кнопку, чтобы открыть приложение."
            ),
            "reply_markup": markup,
        },
    )
    print("send_start_card", result, flush=True)


def send_share_card(chat_id, photo_url: str, caption: str, button_url: str) -> bool:
    markup = json.dumps(
        {"inline_keyboard": [[{"text": "Открыть в каталоге", "url": button_url}]]}
    )
    if photo_url:
        result = _bot_api(
            "sendPhoto",
            {
                "chat_id": int(chat_id),
                "photo": photo_url,
                "caption": caption[:1024],
                "parse_mode": "HTML",
                "reply_markup": markup,
            },
            timeout=20,
        )
        if result.get("ok"):
            return True
        print("sendPhoto failed", result, flush=True)
    result = _bot_api(
        "sendMessage",
        {
            "chat_id": int(chat_id),
            "text": caption[:3500],
            "parse_mode": "HTML",
            "reply_markup": markup,
        },
    )
    print("send_share_card message", result, flush=True)
    return bool(result.get("ok"))


def set_telegram_webhook():
    url = (settings.MINI_APP_URL or "").rstrip("/") + "/telegram/webhook/"
    if not url.startswith("https://"):
        print("setWebhook skipped, MINI_APP_URL is not https:", settings.MINI_APP_URL, flush=True)
        return
    result = _bot_api(
        "setWebhook",
        {
            "url": url,
            "allowed_updates": json.dumps(
                [
                    "message",
                    "edited_message",
                    "message_reaction",
                    "message_reaction_count",
                ]
            ),
        },
        timeout=10,
    )
    print("setWebhook", url, result, flush=True)
    return result


def webhook_info() -> dict:
    info = (_bot_api("getWebhookInfo") or {}).get("result") or {}
    return {
        "url": info.get("url") or "",
        "pending": int(info.get("pending_update_count") or 0),
        "last_error": info.get("last_error_message") or "",
    }


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