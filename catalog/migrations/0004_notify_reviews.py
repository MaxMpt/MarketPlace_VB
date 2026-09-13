from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0003_company_map"),
    ]

    operations = [
        migrations.AddField(
            model_name="usersettings",
            name="notify_reviews",
            field=models.BooleanField(default=True),
        ),
    ]