import json
from urllib.parse import unquote

from .models import Resident, UserSettings
from .notify import is_admin
from .telegram import parse_init_data

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
        data = self._identity(request) or FALLBACK
        resident, _ = Resident.objects.update_or_create(
            id=int(data["id"]),
            defaults={
                "first_name": (data.get("first_name") or "Житель")[:255],
                "last_name": (data.get("last_name") or "")[:255],
                "username": (data.get("username") or "")[:32],
                "photo_url": data.get("photo_url") or "",
            },
        )
        settings_row, _ = UserSettings.objects.get_or_create(user=resident)
        request.resident = resident
        request.theme = settings_row.theme
        request.is_admin = is_admin(resident)
        request.tg_real = int(data["id"]) != 1
        return self.get_response(request)

    def _identity(self, request):
        raw = (
            request.META.get("HTTP_X_TELEGRAM_INIT_DATA")
            or request.POST.get("_tg_init")
            or request.COOKIES.get("tg_init")
            or ""
        )
        checked = parse_init_data(raw)
        if checked:
            return checked
        cookie = request.COOKIES.get("tg_user")
        if not cookie:
            return None
        try:
            parsed = json.loads(unquote(cookie))
        except (json.JSONDecodeError, TypeError, ValueError):
            return None
        if not parsed.get("id") or int(parsed["id"]) == 1:
            return None
        return {
            "id": int(parsed["id"]),
            "first_name": parsed.get("first_name") or "Житель",
            "last_name": parsed.get("last_name") or "",
            "username": parsed.get("username") or "",
            "photo_url": parsed.get("photo_url") or "",
        }