from pathlib import Path

from django.core.files import File
from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


def seed_demo(apps, schema_editor):
    ChatPost = apps.get_model("catalog", "ChatPost")
    HighlightSnapshot = apps.get_model("catalog", "HighlightSnapshot")
    today = timezone.localdate()
    post, _ = ChatPost.objects.update_or_create(
        chat_id=-1003904078904,
        message_id=1,
        defaults={
            "day": today,
            "author_name": "Анна",
            "text": "Во дворе у 3 корпуса снова поставили контейнер для вторсырья. Можно стекло и пластик — сегодня до вечера.",
            "reaction_count": 18,
            "message_url": "https://t.me/c/3904078904/1",
            "is_demo": True,
        },
    )
    photo = Path(__file__).resolve().parents[2] / "static" / "catalog" / "photos" / "courtyard-vb2.jpg"
    if photo.exists() and not post.photo:
        with photo.open("rb") as fh:
            post.photo.save("today.jpg", File(fh), save=True)
    HighlightSnapshot.objects.update_or_create(
        day=today, defaults={"post": post, "computed_at": timezone.now()}
    )


def drop_demo(apps, schema_editor):
    ChatPost = apps.get_model("catalog", "ChatPost")
    HighlightSnapshot = apps.get_model("catalog", "HighlightSnapshot")
    HighlightSnapshot.objects.all().delete()
    ChatPost.objects.filter(is_demo=True).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0008_chat_highlight"),
    ]

    operations = [
        migrations.AddField(
            model_name="chatpost",
            name="is_demo",
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name="HighlightSnapshot",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("day", models.DateField(unique=True)),
                ("computed_at", models.DateTimeField()),
                (
                    "post",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="catalog.chatpost",
                    ),
                ),
            ],
        ),
        migrations.RunPython(seed_demo, drop_demo),
    ]