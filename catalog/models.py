from django.db import models
from django.db.models import Avg, Count
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = AliveQuerySet.as_manager()

    class Meta:
        ordering = ["-rating_value", "id"]

    def cover(self):
        photo = self.photos.alive().order_by("sort_order", "id").first()
        return photo.src if photo else ""

    def recalc_rating(self):
        agg = self.reviews.alive().aggregate(avg=Avg("rating"), cnt=Count("id"))
        self.rating_count = agg["cnt"] or 0
        self.rating_value = round(agg["avg"] or 0, 2)
        self.save(update_fields=["rating_count", "rating_value"])

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
        ordering = ["-rating_value", "id"]

    def cover(self):
        photo = self.photos.alive().order_by("sort_order", "id").first()
        return photo.src if photo else ""

    def price_label(self):
        if self.price_note:
            return self.price_note
        if self.price_cents is None:
            return "договорная"
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
    address = models.CharField(max_length=255, blank=True, default="")
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    map_provider = models.CharField(
        max_length=8, default="yandex", choices=[("yandex", "Яндекс"), ("google", "Google")]
    )
    author_name = models.CharField(max_length=64, default="Житель")
    rating = models.SmallIntegerField()
    review_text = models.TextField(blank=True, default="")
    create_date = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = AliveQuerySet.as_manager()

    class Meta:
        ordering = ["-create_date"]

    @property
    def target_name(self):
        if self.service_id:
            return self.service.name
        if self.company_id:
            return self.company.name
        return ""

    @property
    def target_url(self):
        if self.service_id:
            return f"/services/{self.service_id}/"
        if self.company_id:
            return f"/companies/{self.company_id}/"
        return "/"


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
