from django.contrib import admin

from .models import Company, Photo, RatingReview, Resident, Service, ServiceCategory, UserSettings


@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "username")


@admin.register(ServiceCategory)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "sort_order")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "rating_value", "rating_count")


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "rating_value", "rating_count")


admin.site.register(RatingReview)
admin.site.register(Photo)
admin.site.register(UserSettings)