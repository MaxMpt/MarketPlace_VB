from django.db.models import Prefetch
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST
from urllib.parse import quote

from .models import Company, Photo, RatingReview, Service, ServiceCategory, UserSettings
from .notify import is_admin, login_of, notify_admins, send_telegram, stars_word
from .utils import parse_price_input, save_resized_image, share_url, telegram_contact_url


def _photos():
    return Prefetch("photos", queryset=Photo.objects.alive().order_by("sort_order", "id"))


def home(request):
    services = (
        Service.objects.alive()
        .select_related("category", "create_user")
        .prefetch_related(_photos())
        .order_by("-rating_value", "-rating_count", "id")[:3]
    )
    companies = (
        Company.objects.alive()
        .prefetch_related(_photos())
        .order_by("-rating_value", "-rating_count", "id")[:2]
    )
    return render(
        request,
        "catalog/home.html",
        {
            "categories": ServiceCategory.objects.alive(),
            "services": services,
            "companies": companies,
            "service_count": Service.objects.alive().count(),
            "company_count": Company.objects.alive().count(),
            "title": "ВБ2 Каталог",
        },
    )


def services_list(request):
    slug = request.GET.get("cat") or ""
    qs = Service.objects.alive().select_related("category", "create_user").prefetch_related(_photos()).order_by(
        "-rating_value", "-rating_count", "id"
    )
    if slug:
        qs = qs.filter(category__slug=slug)
    return render(
        request,
        "catalog/services.html",
        {
            "categories": ServiceCategory.objects.alive(),
            "services": qs,
            "active_cat": slug,
            "title": "Услуги жителей",
        },
    )


def _contact(request, author, title, kind):
    if not author or not author.username or author.id == request.resident.id:
        return ""
    if kind == "service":
        text = (
            f"Здравствуйте! Обращаюсь по услуге «{title}» "
            f"из каталога двора Восточное Бутово 2. Можно уточнить детали?"
        )
    else:
        text = (
            f"Здравствуйте! Обращаюсь по компании «{title}» "
            f"из каталога двора Восточное Бутово 2. Подскажите, пожалуйста."
        )
    return telegram_contact_url(author.username, text)


def _parse_point(request):
    try:
        lat = request.POST.get("lat") or None
        lng = request.POST.get("lng") or None
        if lat and lng:
            return float(lat), float(lng)
    except (TypeError, ValueError):
        pass
    return None, None


def service_detail(request, pk):
    service = get_object_or_404(
        Service.objects.alive().select_related("category", "create_user").prefetch_related(_photos()),
        pk=pk,
    )
    reviews = service.reviews.alive().select_related("create_user").prefetch_related(_photos())
    my_review = reviews.filter(create_user=request.resident).first()
    return render(
        request,
        "catalog/service_detail.html",
        {
            "service": service,
            "photos": service.photos.alive(),
            "reviews": reviews,
            "my_review": my_review,
            "contact_url": _contact(request, service.create_user, service.name, "service"),
            "share_url": share_url(f"/services/{service.pk}/", service.name),
            "is_admin": is_admin(request.resident),
            "title": service.name,
            "back": "/services/",
        },
    )


def companies_list(request):
    companies = Company.objects.alive().prefetch_related(_photos()).order_by("-rating_value", "-rating_count", "id")
    return render(
        request,
        "catalog/companies.html",
        {"companies": companies, "title": "Компании района"},
    )


def company_detail(request, pk):
    company = get_object_or_404(
        Company.objects.alive().select_related("create_user").prefetch_related(_photos()),
        pk=pk,
    )
    reviews = company.reviews.alive().select_related("create_user").prefetch_related(_photos())
    my_review = reviews.filter(create_user=request.resident).first()
    return render(
        request,
        "catalog/company_detail.html",
        {
            "company": company,
            "photos": company.photos.alive(),
            "reviews": reviews,
            "my_review": my_review,
            "share_url": share_url(f"/companies/{company.pk}/", company.name),
            "is_admin": is_admin(request.resident),
            "title": company.name,
            "back": "/companies/",
        },
    )


def profile(request):
    user = request.resident
    listings = (
        Service.objects.alive()
        .filter(create_user=user)
        .select_related("category")
        .prefetch_related(_photos())
    )
    companies = Company.objects.alive().filter(create_user=user).prefetch_related(_photos())
    reviews = RatingReview.objects.alive().filter(create_user=user).select_related("service", "company")
    prefs, _ = UserSettings.objects.get_or_create(user=user)
    return render(
        request,
        "catalog/profile.html",
        {
            "listings": listings,
            "my_companies": companies,
            "reviews": reviews,
            "listing_count": listings.count() + companies.count(),
            "title": "Профиль",
            "notify_reviews": prefs.notify_reviews,
            "support_url": "https://t.me/ima_ecosystem?direct",
        },
    )


@require_POST
def toggle_theme(request):
    settings_row, _ = UserSettings.objects.get_or_create(user=request.resident)
    settings_row.theme = "light" if settings_row.theme == "dark" else "dark"
    settings_row.save(update_fields=["theme", "updated_at"])
    response = redirect("profile")
    secure = True
    try:
        from django.conf import settings as dj
        secure = (dj.MINI_APP_URL or "").startswith("https://")
    except Exception:
        pass
    response.set_cookie(
        "vb_theme",
        settings_row.theme,
        max_age=31536000,
        path="/",
        samesite="None" if secure else "Lax",
        secure=secure,
    )
    return response


@require_POST
def toggle_notify(request):
    settings_row, _ = UserSettings.objects.get_or_create(user=request.resident)
    settings_row.notify_reviews = not settings_row.notify_reviews
    settings_row.save(update_fields=["notify_reviews", "updated_at"])
    return redirect("profile")


@require_POST
def delete_listing(request):
    kind = request.POST.get("kind")
    pk = request.POST.get("pk")
    user = request.resident
    admin = is_admin(user)
    if kind == "service":
        qs = Service.objects.alive()
        item = get_object_or_404(qs, pk=pk) if admin else get_object_or_404(qs, pk=pk, create_user=user)
        label = f"услуга «{item.name}»"
    elif kind == "company":
        qs = Company.objects.alive()
        item = get_object_or_404(qs, pk=pk) if admin else get_object_or_404(qs, pk=pk, create_user=user)
        label = f"компания «{item.name}»"
    else:
        return redirect("profile")
    item.deleted_at = timezone.now()
    item.save(update_fields=["deleted_at"])
    if admin and item.create_user_id and item.create_user_id != user.id:
        send_telegram(
            item.create_user_id,
            f"Ваша {label} удалена администратором. "
            f"Если это ошибка — напишите в поддержку: https://t.me/ima_ecosystem",
        )
    if admin and not (item.create_user_id == user.id):
        nxt = request.POST.get("next") or ("/services/" if kind == "service" else "/companies/")
        return redirect(nxt)
    return redirect("profile")


@require_POST
def delete_review(request):
    if not is_admin(request.resident):
        return redirect("home")
    review = get_object_or_404(RatingReview.objects.alive(), pk=request.POST.get("pk"))
    review.deleted_at = timezone.now()
    review.save(update_fields=["deleted_at"])
    if review.service_id:
        review.service.recalc_rating()
        return redirect("service_detail", pk=review.service_id)
    if review.company_id:
        review.company.recalc_rating()
        return redirect("company_detail", pk=review.company_id)
    return redirect("home")


def _need_telegram(request):
    if getattr(request, "tg_real", False):
        return ""
    return "Откройте каталог из Telegram-бота (/start) и создайте карточку ещё раз. Сейчас вы как гость."


def add_listing(request):
    categories = list(ServiceCategory.objects.alive())
    error = ""
    kind = request.POST.get("kind", "service")
    if request.method == "POST":
        blocked = _need_telegram(request)
        if blocked:
            error = blocked
        else:
            name = (request.POST.get("name") or "").strip()
            description = (request.POST.get("description") or "").strip()
            price_note = (request.POST.get("price_note") or "").strip()
            kind = request.POST.get("kind") or "service"
            files = request.FILES.getlist("photos")[:6]
            if len(name) < 2:
                error = "Название слишком короткое"
            elif kind == "service":
                try:
                    category = ServiceCategory.objects.alive().get(pk=int(request.POST.get("category_id") or 0))
                except (ServiceCategory.DoesNotExist, ValueError, TypeError):
                    error = "Выберите категорию"
                else:
                    cents, note = parse_price_input(price_note)
                    service = Service.objects.create(
                        category=category,
                        name=name,
                        description=description,
                        price_cents=cents,
                        price_note=note,
                        create_user=request.resident,
                    )
                    _save_photos(files, service=service)
                    notify_admins(
                        f"Новая услуга «{service.name}» от {login_of(request.resident)}"
                    )
                    return redirect("service_detail", pk=service.pk)
            else:
                lat, lng = _parse_point(request)
                provider = request.POST.get("map_provider") or "yandex"
                if provider not in {"yandex", "google"}:
                    provider = "yandex"
                company = Company.objects.create(
                    name=name,
                    description=description,
                    create_user=request.resident,
                    address=(request.POST.get("address") or "").strip()[:255],
                    lat=lat,
                    lng=lng,
                    map_provider=provider,
                )
                _save_photos(files, company=company)
                notify_admins(
                    f"Новая компания «{company.name}» от {login_of(request.resident)}"
                )
                return redirect("company_detail", pk=company.pk)
    return render(
        request,
        "catalog/add.html",
        {
            "categories": categories,
            "title": "Новая карточка",
            "back": "/",
            "error": error,
            "kind": kind,
        },
    )


def _can_edit(user, item):
    if not user:
        return False
    if is_admin(user):
        return True
    return bool(item.create_user_id and item.create_user_id == user.id)


def _price_field(service):
    if service.price_note:
        return service.price_note
    if service.price_cents is not None:
        return str(round(service.price_cents / 100))
    return ""


def edit_service(request, pk):
    service = get_object_or_404(Service.objects.alive().select_related("category"), pk=pk)
    if not _can_edit(request.resident, service):
        return redirect("service_detail", pk=pk)
    error = ""
    if request.method == "POST":
        name = (request.POST.get("name") or "").strip()
        description = (request.POST.get("description") or "").strip()
        if len(name) < 2:
            error = "Название слишком короткое"
        else:
            try:
                category = ServiceCategory.objects.alive().get(pk=int(request.POST.get("category_id") or 0))
            except (ServiceCategory.DoesNotExist, ValueError, TypeError):
                error = "Выберите категорию"
            else:
                cents, note = parse_price_input(request.POST.get("price_note") or "")
                service.category = category
                service.name = name
                service.description = description
                service.price_cents = cents
                service.price_note = note
                service.save()
                files = request.FILES.getlist("photos")[:6]
                if files:
                    _save_photos(files, service=service)
                return redirect("service_detail", pk=service.pk)
    return render(
        request,
        "catalog/edit.html",
        {
            "kind": "service",
            "item": service,
            "categories": ServiceCategory.objects.alive(),
            "price_value": _price_field(service),
            "photos": service.photos.filter(deleted_at__isnull=True).order_by("sort_order", "id"),
            "error": error,
            "title": "Изменить услугу",
            "back": f"/services/{service.pk}/",
        },
    )


def edit_company(request, pk):
    company = get_object_or_404(Company.objects.alive(), pk=pk)
    if not _can_edit(request.resident, company):
        return redirect("company_detail", pk=pk)
    error = ""
    if request.method == "POST":
        name = (request.POST.get("name") or "").strip()
        description = (request.POST.get("description") or "").strip()
        if len(name) < 2:
            error = "Название слишком короткое"
        else:
            lat, lng = _parse_point(request)
            provider = request.POST.get("map_provider") or company.map_provider or "yandex"
            if provider not in {"yandex", "google"}:
                provider = "yandex"
            company.name = name
            company.description = description
            company.address = (request.POST.get("address") or "").strip()[:255]
            if lat and lng:
                company.lat = lat
                company.lng = lng
            company.map_provider = provider
            company.save()
            files = request.FILES.getlist("photos")[:6]
            if files:
                _save_photos(files, company=company)
            return redirect("company_detail", pk=company.pk)
    return render(
        request,
        "catalog/edit.html",
        {
            "kind": "company",
            "item": company,
            "photos": company.photos.filter(deleted_at__isnull=True).order_by("sort_order", "id"),
            "error": error,
            "title": "Изменить компанию",
            "back": f"/companies/{company.pk}/",
        },
    )


@require_POST
def replace_photo(request):
    photo, nxt = _owned_photo(request)
    if not photo:
        return redirect("home")
    uploaded = request.FILES.get("photo")
    if uploaded and getattr(uploaded, "content_type", "").startswith("image/"):
        content = save_resized_image(uploaded, uploaded.name)
        photo.image.save(content.name, content, save=True)
    return redirect(nxt)


@require_POST
def reorder_photo(request):
    photo, nxt = _owned_photo(request)
    if not photo:
        return redirect("home")
    if photo.service_id:
        qs = Photo.objects.filter(service_id=photo.service_id, deleted_at__isnull=True)
    elif photo.company_id:
        qs = Photo.objects.filter(company_id=photo.company_id, deleted_at__isnull=True)
    else:
        return redirect(nxt)
    photos = list(qs.order_by("sort_order", "id"))
    ids = [p.pk for p in photos]
    i = ids.index(photo.pk)
    j = i - 1 if request.POST.get("direction") == "left" else i + 1
    if 0 <= j < len(photos):
        photos[i], photos[j] = photos[j], photos[i]
        for n, item in enumerate(photos):
            if item.sort_order != n:
                item.sort_order = n
                item.save(update_fields=["sort_order"])
    return redirect(nxt)


@require_POST
def delete_photo(request):
    photo, nxt = _owned_photo(request)
    if not photo:
        return redirect("home")
    photo.deleted_at = timezone.now()
    photo.save(update_fields=["deleted_at"])
    if photo.service_id:
        qs = Photo.objects.filter(service_id=photo.service_id, deleted_at__isnull=True)
    elif photo.company_id:
        qs = Photo.objects.filter(company_id=photo.company_id, deleted_at__isnull=True)
    else:
        return redirect(nxt)
    for n, item in enumerate(qs.order_by("sort_order", "id")):
        if item.sort_order != n:
            item.sort_order = n
            item.save(update_fields=["sort_order"])
    return redirect(nxt)


def _owned_photo(request):
    photo = get_object_or_404(Photo.objects.filter(deleted_at__isnull=True), pk=request.POST.get("pk"))
    owner_id = None
    nxt = "/"
    if photo.service_id:
        owner_id = photo.service.create_user_id
        nxt = f"/services/{photo.service_id}/edit/"
    elif photo.company_id:
        owner_id = photo.company.create_user_id
        nxt = f"/companies/{photo.company_id}/edit/"
    if owner_id != request.resident.id and not is_admin(request.resident):
        return None, "/"
    return photo, nxt


@require_POST
def add_review(request):
    rating = int(request.POST.get("rating") or 5)
    rating = min(5, max(1, rating))
    text = (request.POST.get("text") or "").strip()
    service_id = request.POST.get("service_id")
    company_id = request.POST.get("company_id")
    user = request.resident
    if _need_telegram(request):
        return redirect("home")
    files = request.FILES.getlist("photos")[:3]
    if service_id:
        service = get_object_or_404(Service.objects.alive(), pk=service_id)
        review, _ = RatingReview.objects.update_or_create(
            service=service,
            create_user=user,
            deleted_at=None,
            defaults={
                "author_name": user.display_name,
                "rating": rating,
                "review_text": text,
            },
        )
        if files:
            Photo.objects.filter(review=review, deleted_at__isnull=True).update(deleted_at=timezone.now())
            _save_photos(files, review=review)
        service.recalc_rating()
        _notify_review(service.create_user, f"услуге «{service.name}»", user, rating, text)
        return redirect("service_detail", pk=service.pk)
    company = get_object_or_404(Company.objects.alive(), pk=company_id)
    review, _ = RatingReview.objects.update_or_create(
        company=company,
        create_user=user,
        deleted_at=None,
        defaults={
            "author_name": user.display_name,
            "rating": rating,
            "review_text": text,
        },
    )
    if files:
        Photo.objects.filter(review=review, deleted_at__isnull=True).update(deleted_at=timezone.now())
        _save_photos(files, review=review)
    company.recalc_rating()
    _notify_review(company.create_user, f"компании «{company.name}»", user, rating, text)
    return redirect("company_detail", pk=company.pk)


def _notify_review(owner, target, reviewer, rating, text):
    if not owner or owner.id == reviewer.id:
        return
    prefs = UserSettings.objects.filter(user=owner).first()
    if prefs and not prefs.notify_reviews:
        return
    comment = f"\nКомментарий: {text}" if text else ""
    send_telegram(
        owner.id,
        f"Вашей {target} пользователь {reviewer.display_name} поставил {stars_word(rating)}.{comment}",
    )


def _save_photos(files, service=None, company=None, review=None):
    for index, uploaded in enumerate(files):
        if not getattr(uploaded, "content_type", "").startswith("image/"):
            continue
        photo = Photo(service=service, company=company, review=review, sort_order=index)
        content = save_resized_image(uploaded, uploaded.name)
        photo.image.save(content.name, content, save=True)


@require_GET
def geo_suggest(request):
    q = (request.GET.get("q") or "").strip()
    if len(q) < 2:
        return JsonResponse({"items": []})
    items = _nominatim_suggest(q) or _photon_suggest(q)
    return JsonResponse({"items": items})


def _http_json(url: str):
    import json
    import urllib.request

    req = urllib.request.Request(url, headers={"User-Agent": "VB2Catalog/1.0 (catalog)"})
    with urllib.request.urlopen(req, timeout=6) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _nominatim_suggest(q: str):
    query = q if "москв" in q.lower() or "бутов" in q.lower() else f"{q}, Москва"
    url = (
        "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6"
        "&accept-language=ru&countrycodes=ru&q=" + quote(query)
    )
    try:
        rows = _http_json(url) or []
    except Exception:
        return []
    items = []
    for row in rows:
        lat, lng = row.get("lat"), row.get("lon")
        label = (row.get("display_name") or "").split(", Россия")[0]
        if not lat or not lng or not label:
            continue
        items.append({"label": label, "lat": float(lat), "lng": float(lng)})
    return items


def _photon_suggest(q: str):
    url = (
        "https://photon.komoot.io/api/?q="
        + quote(q)
        + "&lat=55.5477&lon=37.5433&limit=6&lang=ru"
    )
    try:
        data = _http_json(url) or {}
    except Exception:
        return []
    items = []
    for feature in data.get("features") or []:
        props = feature.get("properties") or {}
        coords = (feature.get("geometry") or {}).get("coordinates") or [None, None]
        parts = [
            props.get("name"),
            " ".join(p for p in (props.get("street"), props.get("housenumber")) if p),
            props.get("district"),
            props.get("city") or props.get("town") or props.get("village"),
        ]
        label = ", ".join(p for p in parts if p)
        if not label or coords[0] is None:
            continue
        items.append({"label": label, "lat": coords[1], "lng": coords[0]})
    return items
