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
            if value and getattr(post, key) != value:
                setattr(post, key, value)
                changed.append(key)
        if changed:
            post.save(update_fields=changed + ["updated_at"])
    return post


def save_group_message(msg: dict) -> None:
    chat = msg.get("chat") or {}
    if not _is_group(chat.get("id")):
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
    text = _text(msg)
    file_id = _photo_file_id(msg)
    if not text and not file_id:
        return
    post = _ensure_post(
        chat,
        mid,
        _day_from_unix(msg.get("date")),
        author_name=_author(msg),
        text=text,
    )


def save_reaction_count(payload: dict) -> None:
    chat = payload.get("chat") or {}
    if not _is_group(chat.get("id")):
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
    post = _ensure_post(chat, mid, _day_from_unix(payload.get("date")))
    if post.reaction_count != total:
        post.reaction_count = total
        post.save(update_fields=["reaction_count", "updated_at"])


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
    total = ChatReaction.objects.filter(chat_id=chat_id, message_id=mid).count()
    post = _ensure_post(chat, mid, _day_from_unix(payload.get("date")))
    if post.reaction_count != total:
        post.reaction_count = total
        post.save(update_fields=["reaction_count", "updated_at"])


REFRESH = timedelta(hours=2)


def today_highlight():
    gid = group_id()
    if not gid:
        return None
    today = timezone.localdate()
    now = timezone.now()
    snap = HighlightSnapshot.objects.filter(day=today).select_related("post").first()
    if snap and snap.post_id and snap.computed_at and now - snap.computed_at < REFRESH:
        return snap.post
    qs = ChatPost.objects.filter(chat_id=gid, day=today)
    winner = (
        qs.filter(is_demo=False, reaction_count__gte=1).order_by("-reaction_count", "-message_id").first()
        or qs.filter(is_demo=True).order_by("-reaction_count", "-message_id").first()
        or qs.filter(reaction_count__gte=1).order_by("-reaction_count", "-message_id").first()
    )
    HighlightSnapshot.objects.update_or_create(
        day=today, defaults={"post": winner, "computed_at": now}
    )
    return winner


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