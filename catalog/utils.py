from io import BytesIO
import re
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


def telegram_contact_url(username: str, text: str) -> str:
    if not username:
        return ""
    return f"https://t.me/{username}?text={quote(text)}"
