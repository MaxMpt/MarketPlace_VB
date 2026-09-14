import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl, unquote

from django.conf import settings


def parse_init_data(raw: str):
    token = settings.TELEGRAM_BOT_TOKEN
    if not raw or not token:
        return None
    raw = unquote(raw)
    vals = dict(parse_qsl(raw, keep_blank_values=True))
    got = vals.pop("hash", "")
    if not got:
        return None
    data_check = "\n".join(f"{k}={vals[k]}" for k in sorted(vals))
    secret = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
    calc = hmac.new(secret, data_check.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(calc, got):
        return None
    try:
        if int(vals.get("auth_date") or 0) < time.time() - 86400 * 3:
            return None
    except ValueError:
        return None
    try:
        user = json.loads(vals.get("user") or "{}")
    except json.JSONDecodeError:
        return None
    if not user.get("id"):
        return None
    return {
        "id": int(user["id"]),
        "first_name": user.get("first_name") or "Житель",
        "last_name": user.get("last_name") or "",
        "username": user.get("username") or "",
        "photo_url": user.get("photo_url") or "",
    }