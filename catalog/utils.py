from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image


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
    image = image.convert("RGB")
    image.thumbnail((960, 960))
    buf = BytesIO()
    image.save(buf, format="JPEG", quality=72)
    return ContentFile(buf.getvalue(), name=name.rsplit(".", 1)[0][:40] + ".jpg")
