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
    path("companies/", views.companies_list, name="companies"),
    path("companies/<int:pk>/", views.company_detail, name="company_detail"),
    path("profile/", views.profile, name="profile"),
    path("profile/theme/", views.toggle_theme, name="toggle_theme"),
    path("add/", views.add_listing, name="add"),
    path("reviews/add/", views.add_review, name="add_review"),
]
