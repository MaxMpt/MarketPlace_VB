import json
from urllib.parse import unquote

from .models import Resident, UserSettings

FALLBACK = {
    "id": 1,
    "first_name": "Даниил",
    "last_name": "",
    "username": "open_url",
    "photo_url": "/static/catalog/photos/avatar.gif",
}


class ResidentMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        data = FALLBACK
        raw = request.COOKIES.get("tg_user")
        if raw:
            try:
                parsed = json.loads(unquote(raw))
                if parsed.get("id"):
                    data = {**FALLBACK, **parsed}
            except (json.JSONDecodeError, TypeError, ValueError):
                pass
        resident, _ = Resident.objects.update_or_create(
            id=int(data["id"]),
            defaults={
                "first_name": (data.get("first_name") or "Житель")[:255],
                "last_name": (data.get("last_name") or "")[:255],
                "username": (data.get("username") or "")[:32],
                "photo_url": data.get("photo_url") or "",
            },
        )
        settings, _ = UserSettings.objects.get_or_create(user=resident)
        request.resident = resident
        request.theme = settings.theme
        return self.get_response(request)
