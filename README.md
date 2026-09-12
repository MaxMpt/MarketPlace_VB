# ВБ2 Каталог — Django

Telegram Mini App двора на Django. Откройте эту папку в PyCharm.

## Запуск в PyCharm

1. File → Open — выберите папку проекта.
2. PyCharm предложит интерпретатор: укажите `.venv` (или `Python Interpreter` → Add → Existing → `.venv/bin/python`).
3. Terminal в PyCharm:

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver 0.0.0.0:8080
```

4. Run → Edit Configurations → Django server: host `0.0.0.0`, port `8080`.

Админка: `/admin/` (создайте пользователя: `python manage.py createsuperuser`).

База по умолчанию — SQLite (`db.sqlite3`). Для Postgres в `config/settings.py` замените `DATABASES`.
