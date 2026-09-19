from django.db import migrations, models
import django.db.models.deletion


def seed_company_categories(apps, schema_editor):
    CompanyCategory = apps.get_model("catalog", "CompanyCategory")
    Company = apps.get_model("catalog", "Company")
    rows = [
        ("shops", "Магазины", 10),
        ("pharmacy", "Аптеки", 20),
        ("cafe", "Кафе", 30),
        ("kids", "Дети", 40),
        ("health", "Медицина", 50),
        ("household", "Быт", 60),
        ("sport", "Спорт", 70),
        ("other", "Другое", 80),
    ]
    cats = {}
    for slug, title, order in rows:
        cat, _ = CompanyCategory.objects.update_or_create(
            slug=slug, defaults={"title": title, "sort_order": order}
        )
        cats[slug] = cat
    mapping = {
        "Пятёрочка на Полянах": "shops",
        "Аптека у дома": "pharmacy",
        "Детский клуб «Светлячок»": "kids",
    }
    other = cats["other"]
    for company in Company.objects.all():
        company.category = cats.get(mapping.get(company.name), other)
        company.save(update_fields=["category"])


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0004_notify_reviews"),
    ]

    operations = [
        migrations.CreateModel(
            name="CompanyCategory",
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
        migrations.AddField(
            model_name="company",
            name="category",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="companies",
                to="catalog.companycategory",
            ),
        ),
        migrations.RunPython(seed_company_categories, migrations.RunPython.noop),
    ]