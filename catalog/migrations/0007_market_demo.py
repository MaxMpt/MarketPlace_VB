from django.db import migrations


ITEMS = [
    (
        "clothing",
        "Куртка зимняя, 46",
        "Тёмно-синяя, почти не носили. Капюшон отстёгивается, без пятен и потёртостей.",
        450000,
        "catalog/photos/hair.jpg",
    ),
    (
        "electronics",
        "Кофеварка капельная",
        "Рабочая, фильтр новый. Отдам с мерной ложкой и инструкцией.",
        220000,
        "catalog/photos/repair.jpg",
    ),
    (
        "kids",
        "Конструктор, коробка полная",
        "Все детали на месте, инструкция внутри. Ребёнок вырос — отдаём соседям.",
        180000,
        "catalog/photos/kids.jpg",
    ),
]


def add_items(apps, schema_editor):
    MarketCategory = apps.get_model("catalog", "MarketCategory")
    MarketItem = apps.get_model("catalog", "MarketItem")
    Photo = apps.get_model("catalog", "Photo")
    Resident = apps.get_model("catalog", "Resident")
    user = Resident.objects.filter(pk=1).first() or Resident.objects.order_by("id").first()
    cats = {c.slug: c for c in MarketCategory.objects.filter(deleted_at__isnull=True)}
    for slug, name, desc, cents, photo in ITEMS:
        cat = cats.get(slug)
        if not cat:
            continue
        item, created = MarketItem.objects.get_or_create(
            name=name,
            defaults={
                "category": cat,
                "description": desc,
                "price_cents": cents,
                "create_user": user,
            },
        )
        if created or not Photo.objects.filter(market=item).exists():
            Photo.objects.get_or_create(
                market=item, external_url=photo, defaults={"sort_order": 0}
            )


def drop_items(apps, schema_editor):
    MarketItem = apps.get_model("catalog", "MarketItem")
    MarketItem.objects.filter(name__in=[row[1] for row in ITEMS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0006_market"),
    ]

    operations = [
        migrations.RunPython(add_items, drop_items),
    ]