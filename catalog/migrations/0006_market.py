from django.db import migrations, models
import django.db.models.deletion


def seed_market(apps, schema_editor):
    MarketCategory = apps.get_model("catalog", "MarketCategory")
    rows = [
        ("clothing", "Одежда", 10),
        ("kids", "Детское", 20),
        ("home", "Для дома", 30),
        ("electronics", "Техника", 40),
        ("hobby", "Хобби", 50),
        ("auto", "Авто", 60),
        ("other", "Другое", 70),
    ]
    for slug, title, order in rows:
        MarketCategory.objects.update_or_create(
            slug=slug, defaults={"title": title, "sort_order": order}
        )


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0005_company_category"),
    ]

    operations = [
        migrations.CreateModel(
            name="MarketCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("slug", models.SlugField(max_length=32)),
                ("title", models.CharField(max_length=64)),
                ("sort_order", models.SmallIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={"ordering": ["sort_order", "id"]},
        ),
        migrations.CreateModel(
            name="MarketItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True, default="")),
                ("price_cents", models.IntegerField(blank=True, null=True)),
                ("price_note", models.CharField(blank=True, default="", max_length=64)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                (
                    "category",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="items",
                        to="catalog.marketcategory",
                    ),
                ),
                (
                    "create_user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="market_items",
                        to="catalog.resident",
                    ),
                ),
            ],
            options={"ordering": ["-id"]},
        ),
        migrations.AddField(
            model_name="photo",
            name="market",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="photos",
                to="catalog.marketitem",
            ),
        ),
        migrations.RunPython(seed_market, migrations.RunPython.noop),
    ]