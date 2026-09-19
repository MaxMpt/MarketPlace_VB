from django.db import migrations


def drop_demo(apps, schema_editor):
    ChatPost = apps.get_model("catalog", "ChatPost")
    HighlightSnapshot = apps.get_model("catalog", "HighlightSnapshot")
    ChatPost.objects.filter(is_demo=True).delete()
    HighlightSnapshot.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0009_highlight_snapshot"),
    ]

    operations = [
        migrations.RunPython(drop_demo, migrations.RunPython.noop),
    ]