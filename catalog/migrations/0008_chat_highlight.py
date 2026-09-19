from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0007_market_demo"),
    ]

    operations = [
        migrations.CreateModel(
            name="ChatPost",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("chat_id", models.BigIntegerField()),
                ("message_id", models.IntegerField()),
                ("day", models.DateField(db_index=True)),
                ("author_name", models.CharField(blank=True, default="", max_length=255)),
                ("text", models.TextField(blank=True, default="")),
                ("photo", models.ImageField(blank=True, null=True, upload_to="highlights/%Y/%m/")),
                ("reaction_count", models.IntegerField(default=0)),
                ("message_url", models.CharField(blank=True, default="", max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-reaction_count", "-message_id"]},
        ),
        migrations.AlterUniqueTogether(
            name="chatpost",
            unique_together={("chat_id", "message_id")},
        ),
        migrations.CreateModel(
            name="ChatReaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("chat_id", models.BigIntegerField()),
                ("message_id", models.IntegerField()),
                ("user_id", models.BigIntegerField()),
                ("emoji", models.CharField(default="", max_length=64)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name="chatreaction",
            unique_together={("chat_id", "message_id", "user_id", "emoji")},
        ),
    ]