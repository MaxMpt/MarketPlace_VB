from io import BytesIO
import json
import re
import urllib.request
from urllib.parse import quote

from django.core.files.base import ContentFile
from PIL import Image, ImageOps


def format_rating(value):
    try:
        n = float(value)
    except (TypeError, ValueError):
        return "нет оценок"
    if n <= 0:
        return "нет оценок"
    return f"{n:.1f}".replace(".", ",")


def star_range(value, count=5):
    filled = int(round(float(value or 0)))
    return range(1, count + 1), filled


def save_resized_image(django_file, name: str) -> ContentFile:
    image = Image.open(django_file)
    image = ImageOps.exif_transpose(image) or image
    image = image.convert("RGB")
    image.thumbnail((720, 720))
    buf = BytesIO()
    image.save(buf, format="JPEG", quality=58, optimize=True)
    return ContentFile(buf.getvalue(), name=name.rsplit(".", 1)[0][:40] + ".jpg")


def rotate_saved_image(django_file, degrees: int = 90) -> ContentFile:
    image = Image.open(django_file)
    image = image.convert("RGB")
    image = image.rotate(-degrees, expand=True)
    buf = BytesIO()
    image.save(buf, format="JPEG", quality=70, optimize=True)
    name = getattr(django_file, "name", "photo.jpg").rsplit("/", 1)[-1]
    if "." in name:
        name = name.rsplit(".", 1)[0][:40] + ".jpg"
    return ContentFile(buf.getvalue(), name=name)


def parse_price_input(raw: str):
    text = (raw or "").strip()
    if not text:
        return None, ""
    if text.lower() in {"договорная", "договор", "по договоренности", "по договорённости"}:
        return None, "Договорная"
    stripped = re.sub(r"(?i)руб(?:лей|ля|\.)?|₽|от", "", text)
    stripped = re.sub(r"[\s\u00a0]", "", stripped)
    if stripped.isdigit():
        return int(stripped) * 100, ""
    return None, text


_bot_username_cache = ""


def telegram_bot_username() -> str:
    global _bot_username_cache
    from django.conf import settings

    if settings.TELEGRAM_BOT_USERNAME:
        return settings.TELEGRAM_BOT_USERNAME.lstrip("@")
    if _bot_username_cache:
        return _bot_username_cache
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        return ""
    try:
        with urllib.request.urlopen(
            f"https://api.telegram.org/bot{token}/getMe", timeout=4
        ) as resp:
            data = json.loads(resp.read().decode())
        name = ((data.get("result") or {}).get("username") or "").lstrip("@")
        if name:
            _bot_username_cache = name
        return name
    except Exception:
        return ""


def telegram_app_link(start_param: str = "") -> str:
    name = telegram_bot_username()
    if not name:
        from django.conf import settings

        return settings.MINI_APP_URL
    if start_param:
        return f"https://t.me/{name}?startapp={start_param}"
    return f"https://t.me/{name}"


def listing_share(kind: str, item) -> dict:
    from html import escape
    from django.conf import settings

    param = f"{'s' if kind == 'service' else 'c'}{item.pk}"
    deep = telegram_app_link(param)
    rating = getattr(item, "rating_value", 0) or 0
    count = getattr(item, "rating_count", 0) or 0
    if count:
        rating_line = f"{str(rating).replace('.', ',')} · {count} оценок"
    else:
        rating_line = "пока нет оценок"
    meta = []
    if kind == "service" and getattr(item, "category", None):
        meta.append(item.category.title)
    meta.append(rating_line)
    price = ""
    if kind == "service":
        raw = item.price_label() if callable(getattr(item, "price_label", None)) else getattr(item, "price_label", "")
        price = str(raw or "")
    desc = (item.description or "").strip()
    html = [f"<b>{escape(item.name)}</b>", escape(" · ".join(meta))]
    if price:
        html.append(f"<b>{escape(price)}</b>")
    if desc:
        html.append("")
        html.append(escape(desc[:800]))
    caption = "\n".join(html)
    photo = item.cover() or ""
    if photo.startswith("/"):
        photo = settings.MINI_APP_URL.rstrip("/") + photo
    return {
        "deep": deep,
        "caption": caption,
        "photo": photo,
        "kind": kind,
        "pk": item.pk,
    }


def telegram_contact_url(username: str, text: str) -> str:
    if not username:
        return ""
    return f"https://t.me/{username}?text={quote(text)}"