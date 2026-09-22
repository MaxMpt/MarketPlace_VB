from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0011_accent_and_phone"),
    ]

    operations = [
        migrations.AddField(
            model_name="resident",
            name="phone",
            field=models.CharField(blank=True, default="", max_length=20),
        ),
    ]