from django.db import models
from django.db.models import Avg, Count, Q
from django.templatetags.static import static


class AliveQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(deleted_at__isnull=True)


class Resident(models.Model):
    id = models.BigIntegerField(primary_key=True)
    username = models.CharField(max_length=32, blank=True, default="")
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True, default="")
    photo_url = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = AliveQuerySet.as_manager()

    @property
    def display_name(self):
        return " ".join(part for part in (self.first_name, self.last_name) if part).strip() or "Житель"

    @property
    def avatar(self):
        return self.photo_url or static("catalog/photos/avatar.gif")

    def __str__(self):
        return self.display_name


class UserSettings(models.Model):
    user = models.OneToOneField(Resident, on_delete=models.CASCADE, related_name="settings")
    theme = models.CharField(max_length=8, default="light", choices=[("light", "светлая"), ("dark", "тёмная")])
    notify_reviews = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)


class ServiceCategory(models.Model):
    slug = models.SlugField(max_length=32)
    title = models.CharField(max_length=64)
    sort_order = models.SmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = AliveQuerySet.as_manager()

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title


class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    rating_value = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.IntegerField(default=0)
    create_user = models.ForeignKey(
        Resident, null=True, blank=True, on_delete=models.SET_NULL, related_name="companies"
    )
    address = models.CharField(max_length=255, blank=True, default="")
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    map_provider = models.CharField(
        max_length=8, default="yandex", choices=[("yandex", "Яндекс"), ("google", "Google")]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = AliveQuerySet.as_manager()

    class Meta:
        ordering = ["-rating_value", "-rating_count", "id"]

    def cover(self):
        photo = self.photos.alive().order_by("sort_order", "id").first()
        return photo.src if photo else ""

    def recalc_rating(self):
        agg = self.reviews.alive().aggregate(avg=Avg("rating"), cnt=Count("id"))
        self.rating_count = agg["cnt"] or 0
        self.rating_value = round(agg["avg"] or 0, 2)
        self.save(update_fields=["rating_count", "rating_value"])

    @property
    def has_point(self):
        return self.lat is not None and self.lng is not None

    @property
    def route_url(self):
        from urllib.parse import quote

        if self.has_point:
            lat, lng = float(self.lat), float(self.lng)
            if self.map_provider == "google":
                return f"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}"
            return f"https://yandex.ru/maps/?rtext=~{lat},{lng}&rtt=auto"
        if self.address:
            q = quote(self.address)
            if self.map_provider == "google":
                return f"https://www.google.com/maps/search/?api=1&query={q}"
            return f"https://yandex.ru/maps/?text={q}"
        return ""

    @property
    def maps_cta(self):
        return "Маршрут в Google Maps" if self.map_provider == "google" else "Маршрут в Яндекс.Картах"

    @property
    def embed_url(self):
        from urllib.parse import quote

        if self.has_point:
            lat, lng = float(self.lat), float(self.lng)
            if self.map_provider == "google":
                return f"https://maps.google.com/maps?q={lat},{lng}&hl=ru&z=16&output=embed"
            return f"https://yandex.ru/map-widget/v1/?ll={lng},{lat}&pt={lng},{lat}&z=16&l=map"
        if self.address:
            q = quote(self.address)
            if self.map_provider == "google":
                return f"https://maps.google.com/maps?q={q}&hl=ru&z=16&output=embed"
            return f"https://yandex.ru/map-widget/v1/?text={q}&z=16"
        return ""

    def __str__(self):
        return self.name


class Service(models.Model):
    category = models.ForeignKey(ServiceCategory, on_delete=models.PROTECT, related_name="services")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    price_cents = models.IntegerField(null=True, blank=True)
    price_note = models.CharField(max_length=64, blank=True, default="")
    rating_value = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.IntegerField(default=0)
    create_user = models.ForeignKey(
        Resident, null=True, blank=True, on_delete=models.SET_NULL, related_name="services"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = AliveQuerySet.as_manager()

    class Meta:
        ordering = ["-rating_value", "-rating_count", "id"]

    def cover(self):
        photo = self.photos.alive().order_by("sort_order", "id").first()
        return photo.src if photo else ""

    def price_label(self):
        if self.price_note:
            return self.price_note
        if self.price_cents is None:
            return "Договорная"
        rub = round(self.price_cents / 100)
        return f"от {rub:,}".replace(",", " ") + " ₽"

    def recalc_rating(self):
        agg = self.reviews.alive().aggregate(avg=Avg("rating"), cnt=Count("id"))
        self.rating_count = agg["cnt"] or 0
        self.rating_value = round(agg["avg"] or 0, 2)
        self.save(update_fields=["rating_count", "rating_value"])

    def __str__(self):
        return self.name


class RatingReview(models.Model):
    company = models.ForeignKey(
        Company, null=True, blank=True, on_delete=models.CASCADE, related_name="reviews"
    )
    service = models.ForeignKey(
        Service, null=True, blank=True, on_delete=models.CASCADE, related_name="reviews"
    )
    create_user = models.ForeignKey(Resident, on_delete=models.PROTECT, related_name="reviews")
    author_name = models.CharField(max_length=64, default="Житель")
    rating = models.SmallIntegerField()
    review_text = models.TextField(blank=True, default="")
    create_date = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = AliveQuerySet.as_manager()

    class Meta:
        ordering = ["-create_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["create_user", "service"],
                condition=Q(deleted_at__isnull=True, service__isnull=False),
                name="uq_review_user_service_alive",
            ),
            models.UniqueConstraint(
                fields=["create_user", "company"],
                condition=Q(deleted_at__isnull=True, company__isnull=False),
                name="uq_review_user_company_alive",
            ),
        ]

    @property
    def target_name(self):
        if self.service_id and self.service:
            name = self.service.name
            return f"{name} (удалено)" if self.service.deleted_at else name
        if self.company_id and self.company:
            name = self.company.name
            return f"{name} (удалено)" if self.company.deleted_at else name
        return "Карточка удалена"

    @property
    def target_alive(self):
        if self.service_id and self.service:
            return self.service.deleted_at is None
        if self.company_id and self.company:
            return self.company.deleted_at is None
        return False

    @property
    def target_url(self):
        if not self.target_alive:
            return ""
        if self.service_id:
            return f"/services/{self.service_id}/"
        if self.company_id:
            return f"/companies/{self.company_id}/"
        return ""


class Photo(models.Model):
    review = models.ForeignKey(
        RatingReview, null=True, blank=True, on_delete=models.CASCADE, related_name="photos"
    )
    service = models.ForeignKey(
        Service, null=True, blank=True, on_delete=models.CASCADE, related_name="photos"
    )
    company = models.ForeignKey(
        Company, null=True, blank=True, on_delete=models.CASCADE, related_name="photos"
    )
    image = models.ImageField(upload_to="listings/%Y/%m/", blank=True, null=True)
    external_url = models.TextField(blank=True, default="")
    sort_order = models.SmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = AliveQuerySet.as_manager()

    class Meta:
        ordering = ["sort_order", "id"]

    @property
    def src(self):
        if self.image:
            return self.image.url
        if self.external_url.startswith("/"):
            return self.external_url
        if self.external_url:
            return static(self.external_url)
        return ""
