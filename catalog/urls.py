from django.http import JsonResponse
from django.urls import path

from . import views


def app_env(_request):
    return JsonResponse({})


urlpatterns = [
    path("", views.home, name="home"),
    path("__app-env", app_env),
    path("services/", views.services_list, name="services"),
    path("services/<int:pk>/", views.service_detail, name="service_detail"),
    path("services/<int:pk>/edit/", views.edit_service, name="edit_service"),
    path("companies/", views.companies_list, name="companies"),
    path("companies/<int:pk>/", views.company_detail, name="company_detail"),
    path("companies/<int:pk>/edit/", views.edit_company, name="edit_company"),
    path("profile/", views.profile, name="profile"),
    path("profile/theme/", views.toggle_theme, name="toggle_theme"),
    path("profile/notify/", views.toggle_notify, name="toggle_notify"),
    path("profile/delete/", views.delete_listing, name="delete_listing"),
    path("reviews/delete/", views.delete_review, name="delete_review"),
    path("photos/replace/", views.replace_photo, name="replace_photo"),
    path("photos/reorder/", views.reorder_photo, name="reorder_photo"),
    path("photos/delete/", views.delete_photo, name="delete_photo"),
    path("add/", views.add_listing, name="add"),
    path("geo/suggest/", views.geo_suggest, name="geo_suggest"),
    path("reviews/add/", views.add_review, name="add_review"),
    path("share/", views.share_listing, name="share_listing"),
    path("telegram/webhook/", views.telegram_webhook, name="telegram_webhook"),
]