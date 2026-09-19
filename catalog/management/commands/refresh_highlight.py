from django.core.management.base import BaseCommand

from catalog.highlight import refresh_today_highlight


class Command(BaseCommand):
    help = "Убирает заглушку и заново выбирает сообщение дня из живых реакций"

    def handle(self, *args, **options):
        winner = refresh_today_highlight()
        if winner:
            self.stdout.write(
                f"Актуально сегодня: #{winner.message_id} · {winner.reaction_count} реакций · {winner.snippet}"
            )
        else:
            self.stdout.write(
                "Заглушка снята. Живого сообщения за сегодня ещё нет — "
                "блок появится, когда в группе поставят реакции."
            )