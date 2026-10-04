from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0013_market_raise"),
    ]

    operations = [
        migrations.AddField(
            model_name="service",
            name="paused_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="marketitem",
            name="was_price_cents",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="marketitem",
            name="sold_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="marketitem",
            name="expire_notified_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
