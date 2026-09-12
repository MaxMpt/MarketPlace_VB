from django.core.management.base import BaseCommand

from catalog.models import Company, Photo, RatingReview, Resident, Service, ServiceCategory


USERS = [
    (1, "open_url", "Даниил"),
    (2, "anna", "Анна"),
    (3, "marina", "Марина"),
    (4, "olga", "Ольга"),
    (5, "ivan", "Иван"),
]

CATEGORIES = [
    ("beauty", "Красота", 10),
    ("food", "Еда", 20),
    ("repair", "Ремонт", 30),
    ("cleaning", "Уборка", 40),
    ("childcare", "Дети", 50),
    ("pets", "Животные", 60),
    ("education", "Репетиторы", 70),
    ("transport", "Переезды", 80),
    ("health", "Здоровье", 90),
    ("other", "Другое", 100),
]

SERVICES = [
    ("beauty", "Маникюр у дома", "Аппаратный маникюр, покрытие гель-лак. Выезд по Восточному Бутово 2, запись в личные сообщения.", 150000, "", 4.80, 3, 2, "catalog/photos/manicure.jpg"),
    ("beauty", "Брови и ресницы", "Ламинирование бровей, окрашивание, оформление. Работаю в своей квартире, корпус 3.", 80000, "", 4.50, 2, 3, "catalog/photos/brows.jpg"),
    ("beauty", "Стрижка женская", "Каре, укладка, детские стрижки. Инструмент свой, выезд по району.", None, "договорная", 4.20, 1, 4, "catalog/photos/hair.jpg"),
    ("food", "Домашние пельмени", "Пельмени и борщ на заказ. Порции от 10 штук, доставка по району вечером.", 45000, "от 450 ₽", 4.90, 2, 4, "catalog/photos/food.jpg"),
    ("repair", "Мелкий бытовой ремонт", "Розетки, смесители, сборка мебели. Вечер после 18:00, инструмент свой.", 120000, "", 4.60, 2, 5, "catalog/photos/repair.jpg"),
    ("cleaning", "Уборка квартиры", "Поддерживающая и генеральная. Свои средства, 2–4 часа.", 250000, "", 4.70, 1, 3, "catalog/photos/cleaning.jpg"),
    ("childcare", "Няня на вечер", "Посидеть с ребёнком 3–8 лет, прогулка во двор, уроки. Соседка из 12 подъезда.", 60000, "от 600 ₽/час", 5.00, 1, 2, "catalog/photos/kids.jpg"),
]

COMPANIES = [
    ("Пятёрочка на Полянах", "Продукты, готовка, пекарня. Открыто до 23:00.", 4.10, 2, 1, "catalog/photos/shop.jpg"),
    ("Аптека у дома", "Лекарства, детское питание, очередь обычно короткая.", 4.60, 2, 1, "catalog/photos/pharmacy.jpg"),
    ("Детский клуб «Светлячок»", "Развивающие занятия 3–6 лет, суббота утром.", 4.90, 1, 4, "catalog/photos/kids.jpg"),
]

SERVICE_REVIEWS = [
    ("Маникюр у дома", 3, "Катя", 5, "Держится три недели, очень аккуратно."),
    ("Маникюр у дома", 4, "Юля", 4, "Хорошо, чуть задержалась к записи."),
    ("Маникюр у дома", 5, "Ирина", 5, "Буду записываться ещё."),
    ("Брови и ресницы", 2, "Лена", 5, "Форма идеальная, не пережгла."),
    ("Брови и ресницы", 5, "Даша", 4, "Чуть ярче, чем хотела, но красиво."),
    ("Стрижка женская", 2, "Наташа", 4, "Стрижёт уверенно, дома чисто."),
    ("Домашние пельмени", 2, "Сергей", 5, "Как у бабушки. Беру на неделю."),
    ("Домашние пельмени", 5, "Олег", 5, "Борщ густой, пельмени не разварились."),
    ("Мелкий бытовой ремонт", 2, "Павел", 5, "Повесил полку и починил смеситель за вечер."),
    ("Мелкий бытовой ремонт", 3, "Алина", 4, "Приехал позже, но сделал на совесть."),
    ("Уборка квартиры", 5, "Кирилл", 5, "После генеральной блестит плитка."),
    ("Няня на вечер", 5, "Мария", 5, "Ребёнок сам просил ещё."),
]

COMPANY_REVIEWS = [
    ("Пятёрочка на Полянах", 2, "Анна", 4, "Хлеб свежий, вечером очереди."),
    ("Пятёрочка на Полянах", 5, "Иван", 4, "Нормальный магазин у дома."),
    ("Аптека у дома", 3, "Марина", 5, "Нужное всегда есть, кассир вежливый."),
    ("Аптека у дома", 4, "Ольга", 4, "Цены чуть выше сети, но близко."),
    ("Детский клуб «Светлячок»", 2, "Анна", 5, "Дочка бежит на занятия сама."),
]


class Command(BaseCommand):
    help = "Заполняет каталог двора демо-данными"

    def handle(self, *args, **options):
        for uid, username, first in USERS:
            Resident.objects.update_or_create(
                id=uid, defaults={"username": username, "first_name": first}
            )
        cats = {}
        for slug, title, order in CATEGORIES:
            cat, _ = ServiceCategory.objects.update_or_create(
                slug=slug, defaults={"title": title, "sort_order": order}
            )
            cats[slug] = cat
        for slug, name, desc, cents, note, rating, count, uid, photo in SERVICES:
            service, created = Service.objects.get_or_create(
                name=name,
                defaults={
                    "category": cats[slug],
                    "description": desc,
                    "price_cents": cents,
                    "price_note": note,
                    "rating_value": rating,
                    "rating_count": count,
                    "create_user_id": uid,
                },
            )
            if created or not service.photos.exists():
                Photo.objects.get_or_create(
                    service=service, external_url=photo, defaults={"sort_order": 0}
                )
        for name, desc, rating, count, uid, photo in COMPANIES:
            company, created = Company.objects.get_or_create(
                name=name,
                defaults={
                    "description": desc,
                    "rating_value": rating,
                    "rating_count": count,
                    "create_user_id": uid,
                },
            )
            if created or not company.photos.exists():
                Photo.objects.get_or_create(
                    company=company, external_url=photo, defaults={"sort_order": 0}
                )
        for name, uid, author, rating, body in SERVICE_REVIEWS:
            service = Service.objects.get(name=name)
            review, created = RatingReview.objects.get_or_create(
                service=service,
                author_name=author,
                defaults={"create_user_id": uid, "rating": rating, "review_text": body},
            )
            if created and name == "Маникюр у дома" and author == "Катя":
                Photo.objects.get_or_create(
                    review=review,
                    external_url="catalog/photos/nails.jpg",
                    defaults={"sort_order": 0},
                )
        for name, uid, author, rating, body in COMPANY_REVIEWS:
            company = Company.objects.get(name=name)
            RatingReview.objects.get_or_create(
                company=company,
                author_name=author,
                defaults={"create_user_id": uid, "rating": rating, "review_text": body},
            )
        self.stdout.write(self.style.SUCCESS("Каталог заполнен"))
