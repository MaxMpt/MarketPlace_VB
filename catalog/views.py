from django.db.models import Prefetch
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .models import Company, Photo, RatingReview, Service, ServiceCategory, UserSettings
from .utils import parse_price_input, save_resized_image, telegram_contact_url


def _photos():
    return Prefetch("photos", queryset=Photo.objects.alive().order_by("sort_order", "id"))


def home(request):
    services = (
        Service.objects.alive()
        .select_related("category", "create_user")
        .prefetch_related(_photos())
        .order_by("-rating_value", "id")[:3]
    )
    companies = (
        Company.objects.alive()
        .prefetch_related(_photos())
        .order_by("-rating_value", "id")[:2]
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
    qs = Service.objects.alive().select_related("category", "create_user").prefetch_related(_photos())
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
            "title": service.name,
            "back": "/services/",
        },
    )


def companies_list(request):
    companies = Company.objects.alive().prefetch_related(_photos())
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
    reviews = company.reviews.alive().select_related("create_user")
    my_review = reviews.filter(create_user=request.resident).first()
    return render(
        request,
        "catalog/company_detail.html",
        {
            "company": company,
            "photos": company.photos.alive(),
            "reviews": reviews,
            "my_review": my_review,
            "contact_url": _contact(request, company.create_user, company.name, "company"),
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
    return render(
        request,
        "catalog/profile.html",
        {
            "listings": listings,
            "my_companies": companies,
            "reviews": reviews,
            "listing_count": listings.count() + companies.count(),
            "title": "Профиль",
        },
    )


@require_POST
def toggle_theme(request):
    settings, _ = UserSettings.objects.get_or_create(user=request.resident)
    settings.theme = "light" if settings.theme == "dark" else "dark"
    settings.save(update_fields=["theme", "updated_at"])
    return redirect("profile")


@require_POST
def delete_listing(request):
    kind = request.POST.get("kind")
    pk = request.POST.get("pk")
    user = request.resident
    if kind == "service":
        item = get_object_or_404(Service.objects.alive(), pk=pk, create_user=user)
    elif kind == "company":
        item = get_object_or_404(Company.objects.alive(), pk=pk, create_user=user)
    else:
        return redirect("profile")
    item.deleted_at = timezone.now()
    item.save(update_fields=["deleted_at"])
    return redirect("profile")


def add_listing(request):
    categories = list(ServiceCategory.objects.alive())
    error = ""
    kind = request.POST.get("kind", "service")
    if request.method == "POST":
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


@require_POST
def add_review(request):
    rating = int(request.POST.get("rating") or 5)
    rating = min(5, max(1, rating))
    text = (request.POST.get("text") or "").strip()
    service_id = request.POST.get("service_id")
    company_id = request.POST.get("company_id")
    user = request.resident
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
        service.recalc_rating()
        return redirect("service_detail", pk=service.pk)
    company = get_object_or_404(Company.objects.alive(), pk=company_id)
    RatingReview.objects.update_or_create(
        company=company,
        create_user=user,
        deleted_at=None,
        defaults={
            "author_name": user.display_name,
            "rating": rating,
            "review_text": text,
        },
    )
    company.recalc_rating()
    return redirect("company_detail", pk=company.pk)


def _save_photos(files, service=None, company=None):
    for index, uploaded in enumerate(files):
        if not getattr(uploaded, "content_type", "").startswith("image/"):
            continue
        photo = Photo(service=service, company=company, sort_order=index)
        content = save_resized_image(uploaded, uploaded.name)
        photo.image.save(content.name, content, save=True)