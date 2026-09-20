from datetime import datetime, timedelta, timezone as dt_tz
import threading
import urllib.request

from django.conf import settings
from django.core.files.base import ContentFile
from django.utils import timezone

from .models import ChatPost, ChatReaction, HighlightSnapshot


def group_id() -> int:
    return int(getattr(settings, "TELEGRAM_GROUP_ID", 0) or 0)


def _is_group(chat_id) -> bool:
    gid = group_id()
    return bool(gid) and int(chat_id) == gid


def _day_from_unix(ts) -> datetime.date:
    try:
        dt = datetime.fromtimestamp(int(ts), tz=dt_tz.utc)
    except (TypeError, ValueError, OSError):
        return timezone.localdate()
    return timezone.localtime(dt).date()


def message_url(chat: dict, message_id: int) -> str:
    username = (chat or {}).get("username") or ""
    if username:
        return f"https://t.me/{username}/{message_id}"
    chat_id = str((chat or {}).get("id") or "")
    if chat_id.startswith("-100"):
        return f"https://t.me/c/{chat_id[4:]}/{message_id}"
    if chat_id.lstrip("-").isdigit():
        return f"https://t.me/c/{chat_id.lstrip('-')}/{message_id}"
    return ""


def _author(msg: dict) -> str:
    user = msg.get("from") or {}
    name = " ".join(p for p in (user.get("first_name"), user.get("last_name")) if p).strip()
    if name:
        return name
    sender = msg.get("sender_chat") or {}
    return sender.get("title") or user.get("username") or "Житель"


def _text(msg: dict) -> str:
    return (msg.get("text") or msg.get("caption") or "").strip()[:800]


def _photo_file_id(msg: dict) -> str:
    photos = msg.get("photo") or []
    if not photos:
        return ""
    return (photos[-1] or {}).get("file_id") or ""


def _ensure_post(chat: dict, message_id: int, day, **fields) -> ChatPost:
    defaults = {
        "day": day,
        "message_url": message_url(chat, message_id),
    }
    defaults.update({k: v for k, v in fields.items() if v not in (None, "")})
    post, created = ChatPost.objects.get_or_create(
        chat_id=int(chat["id"]),
        message_id=int(message_id),
        defaults=defaults,
    )
    if not created:
        changed = []
        for key, value in defaults.items():
            if key == "day":
                continue
            if value and getattr(post, key) != value:
                setattr(post, key, value)
                changed.append(key)
        if changed:
            post.save(update_fields=changed + ["updated_at"])
    return post


def _media_label(msg: dict) -> str:
    if msg.get("photo"):
        return "Фото"
    if msg.get("video") or msg.get("video_note"):
        return "Видео"
    if msg.get("animation"):
        return "GIF"
    if msg.get("document"):
        return "Файл"
    if msg.get("voice") or msg.get("audio"):
        return "Аудио"
    if msg.get("sticker"):
        return "Стикер"
    return ""


def save_group_message(msg: dict) -> None:
    chat = msg.get("chat") or {}
    chat_id = chat.get("id")
    if chat.get("type") in {"group", "supergroup"} and not _is_group(chat_id):
        print("highlight skip chat", chat_id, "expected", group_id(), flush=True)
        return
    if not _is_group(chat_id):
        return
    if msg.get("from", {}).get("is_bot"):
        return
    if any(
        msg.get(key)
        for key in (
            "new_chat_members",
            "left_chat_member",
            "new_chat_title",
            "new_chat_photo",
            "pinned_message",
            "group_chat_created",
        )
    ):
        return
    mid = msg.get("message_id")
    if not mid:
        return
    text = _text(msg) or _media_label(msg)
    if not text:
        return
    _ensure_post(
        chat,
        mid,
        _day_from_unix(msg.get("date")),
        author_name=_author(msg),
        text=text,
    )
    print("highlight saved message", mid, "day", _day_from_unix(msg.get("date")), flush=True)


def save_reaction_count(payload: dict) -> None:
    chat = payload.get("chat") or {}
    if not _is_group(chat.get("id")):
        print("highlight skip count chat", chat.get("id"), "expected", group_id(), flush=True)
        return
    mid = payload.get("message_id")
    if not mid:
        return
    total = 0
    for item in payload.get("reactions") or []:
        try:
            total += int(item.get("total_count") or 0)
        except (TypeError, ValueError):
            pass
    try:
        post = ChatPost.objects.get(chat_id=int(chat["id"]), message_id=int(mid))
    except ChatPost.DoesNotExist:
        print("highlight count unknown message", mid, flush=True)
        return
    if post.reaction_count != total:
        post.reaction_count = total
        post.save(update_fields=["reaction_count", "updated_at"])
    print("highlight count", mid, total, "day", post.day, flush=True)


def save_user_reaction(payload: dict) -> None:
    chat = payload.get("chat") or {}
    if not _is_group(chat.get("id")):
        return
    mid = payload.get("message_id")
    user = payload.get("user") or payload.get("actor_chat") or {}
    uid = user.get("id")
    if not mid or not uid:
        return
    chat_id = int(chat["id"])
    ChatReaction.objects.filter(chat_id=chat_id, message_id=mid, user_id=uid).delete()
    for item in payload.get("new_reaction") or []:
        kind = item.get("type") if isinstance(item.get("type"), str) else (item.get("type") or {}).get("type")
        emoji = item.get("emoji") or (item.get("type") or {}).get("emoji") or item.get("custom_emoji_id") or kind or "x"
        ChatReaction.objects.get_or_create(
            chat_id=chat_id, message_id=mid, user_id=uid, emoji=str(emoji)[:64]
        )
    try:
        post = ChatPost.objects.get(chat_id=chat_id, message_id=int(mid))
    except ChatPost.DoesNotExist:
        return
    seen = ChatReaction.objects.filter(chat_id=chat_id, message_id=mid).count()
    if seen > post.reaction_count:
        post.reaction_count = seen
        post.save(update_fields=["reaction_count", "updated_at"])


REFRESH = timedelta(hours=2)


def _today_posts():
    gid = group_id()
    today = timezone.localdate()
    return ChatPost.objects.filter(chat_id=gid, day=today, is_demo=False)


def today_highlight(force=False):
    gid = group_id()
    if not gid:
        return None
    today = timezone.localdate()
    now = timezone.now()
    snap = HighlightSnapshot.objects.filter(day=today).select_related("post").first()
    if (
        not force
        and snap
        and snap.post_id
        and snap.post
        and not snap.post.is_demo
        and snap.post.day == today
        and snap.computed_at
        and now - snap.computed_at < REFRESH
    ):
        return snap.post
    winner = (
        _today_posts()
        .filter(reaction_count__gte=1)
        .exclude(text="")
        .order_by("-reaction_count", "-message_id")
        .first()
    )
    HighlightSnapshot.objects.update_or_create(
        day=today, defaults={"post": winner, "computed_at": now}
    )
    return winner


def drop_demo_highlights() -> int:
    deleted, _ = ChatPost.objects.filter(is_demo=True).delete()
    HighlightSnapshot.objects.filter(day=timezone.localdate()).delete()
    return deleted


def refresh_today_highlight():
    from .notify import set_telegram_webhook, webhook_info
    from django.conf import settings as dj

    drop_demo_highlights()
    expected = (dj.MINI_APP_URL or "").rstrip("/") + "/telegram/webhook/"
    info = webhook_info()
    current = (info.get("url") or "").rstrip("/")
    if current != expected.rstrip("/"):
        set_telegram_webhook()
    return today_highlight(force=True)


def highlight_stats() -> dict:
    from .notify import webhook_info

    today = timezone.localdate()
    posts = _today_posts()
    info = webhook_info()
    expected = (settings.MINI_APP_URL or "").rstrip("/") + "/telegram/webhook/"
    return {
        "today": today,
        "posts_today": posts.count(),
        "reacted_today": posts.filter(reaction_count__gte=1).exclude(text="").count(),
        "group_id": group_id(),
        "webhook_url": info.get("url") or "",
        "webhook_ok": bool(info.get("url")) and info.get("url").rstrip("/") == expected.rstrip("/"),
        "webhook_error": info.get("last_error") or "",
        "webhook_pending": info.get("pending") or 0,
    }


def _download_photo(pk: int, file_id: str) -> None:
    from .notify import _bot_api

    info = _bot_api("getFile", {"file_id": file_id}, timeout=15)
    path = ((info.get("result") or {}).get("file_path") or "")
    token = settings.TELEGRAM_BOT_TOKEN
    if not path or not token:
        return
    try:
        with urllib.request.urlopen(
            f"https://api.telegram.org/file/bot{token}/{path}", timeout=20
        ) as resp:
            data = resp.read()
    except Exception:
        return
    if not data:
        return
    try:
        post = ChatPost.objects.get(pk=pk)
    except ChatPost.DoesNotExist:
        return
    if post.photo:
        return
    name = f"{post.message_id}.jpg"
    post.photo.save(name, ContentFile(data), save=True)