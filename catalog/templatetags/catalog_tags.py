from django import template

from catalog.utils import format_rating

register = template.Library()


@register.filter
def ru_rating(value):
    return format_rating(value)


@register.inclusion_tag("catalog/_stars.html")
def stars(value, size=14):
    try:
        filled = int(round(float(value or 0)))
    except (TypeError, ValueError):
        filled = 0
    filled = min(5, max(0, filled))
    return {"filled": filled, "empty": 5 - filled, "size": size}
