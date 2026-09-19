from django.contrib import admin
from django.utils import timezone

from .models import (
    Company,
    CompanyCategory,
    MarketCategory,
    MarketItem,
    Photo,
    RatingReview,
    Resident,
    Service,
    ServiceCategory,
    UserSettings,
    ChatPost,
)
from .notify import send_telegram


class SoftDeleteAdmin(admin.ModelAdmin):
    actions = ("hide_and_notify",)

    @admin.action(description="Скрыть и уведомить автора")
    def hide_and_notify(self, request, queryset):
        for item in queryset:
            if getattr(item, "deleted_at", None):
                continue
            item.deleted_at = timezone.now()
            item.save(update_fields=["deleted_at"])
            owner = getattr(item, "create_user", None)
            name = getattr(item, "name", None) or getattr(item, "author_name", "запись")
            if owner:
                kind = (
                    "услуга"
                    if item.__class__.__name__ == "Service"
                    else "рекомендация"
                    if item.__class__.__name__ == "Company"
                    else "вещь"
                    if item.__class__.__name__ == "MarketItem"
                    else "запись"
                )
                send_telegram(
                    owner.id,
                    f"Ваша {kind} «{name}» удалена администратором. "
                    f"Если это ошибка — напишите в поддержку: https://t.me/ima_ecosystem",
                )


@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "username")


@admin.register(ServiceCategory)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "sort_order")


@admin.register(Service)
class ServiceAdmin(SoftDeleteAdmin):
    list_display = ("name", "category", "create_user", "rating_value", "deleted_at")


@admin.register(CompanyCategory)
class CompanyCategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "sort_order")


@admin.register(Company)
class CompanyAdmin(SoftDeleteAdmin):
    list_display = ("name", "category", "address", "create_user", "rating_value", "deleted_at")


@admin.register(MarketCategory)
class MarketCategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "sort_order")


@admin.register(MarketItem)
class MarketItemAdmin(SoftDeleteAdmin):
    list_display = ("name", "category", "create_user", "deleted_at")


@admin.register(RatingReview)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("author_name", "rating", "service", "company", "deleted_at")
    actions = ("hide_reviews",)

    @admin.action(description="Скрыть отзывы")
    def hide_reviews(self, request, queryset):
        for item in queryset.filter(deleted_at__isnull=True):
            item.deleted_at = timezone.now()
            item.save(update_fields=["deleted_at"])
            if item.service_id:
                item.service.recalc_rating()
            if item.company_id:
                item.company.recalc_rating()


admin.site.register(Photo)
admin.site.register(UserSettings)


@admin.register(ChatPost)
class ChatPostAdmin(admin.ModelAdmin):
    list_display = ("day", "author_name", "reaction_count", "message_id", "text")