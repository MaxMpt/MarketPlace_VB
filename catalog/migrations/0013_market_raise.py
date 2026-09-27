from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0012_resident_phone"),
    ]

    operations = [
        migrations.AddField(
            model_name="marketitem",
            name="raised_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="marketitem",
            name="raise_notified_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]