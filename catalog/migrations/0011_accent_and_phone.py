from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0010_drop_demo_highlight"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="accent_color",
            field=models.CharField(blank=True, default="", max_length=8),
        ),
        migrations.AddField(
            model_name="company",
            name="accent_until",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="service",
            name="accent_color",
            field=models.CharField(blank=True, default="", max_length=8),
        ),
        migrations.AddField(
            model_name="service",
            name="accent_until",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="marketitem",
            name="phone",
            field=models.CharField(blank=True, default="", max_length=20),
        ),
    ]