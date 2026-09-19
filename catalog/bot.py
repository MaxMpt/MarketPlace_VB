from django.conf import settings
from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonWebApp,
    Update,
    WebAppInfo,
)
from telegram.ext import Application, CommandHandler, ContextTypes


def _app_url() -> str:
    url = settings.MINI_APP_URL
    return url if url.endswith("/") else url + "/"


def _web_app() -> WebAppInfo:
    return WebAppInfo(url=_app_url())


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message:
        return
    await update.message.reply_text(
        "Добро пожаловать в МАРКЕТПЛЕЙС Восточное Бутово 2.\n\n"
        "Услуги соседей, рекомендации рядом с домом и барахолка.\n\n"
        "Нажмите кнопку, чтобы открыть приложение.",
        reply_markup=InlineKeyboardMarkup(
            [[InlineKeyboardButton("Открыть МАРКЕТПЛЕЙС", web_app=_web_app())]]
        ),
    )


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if update.message:
        await update.message.reply_text("Нажмите /start и откройте МАРКЕТПЛЕЙС.")


async def on_startup(app: Application) -> None:
    await app.bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(text="Каталог", web_app=_web_app())
    )


def build_app() -> Application:
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        raise RuntimeError(
            "Нет TELEGRAM_BOT_TOKEN. Скопируйте .env.example в .env и вставьте токен от @BotFather."
        )
    application = (
        Application.builder()
        .token(token)
        .post_init(on_startup)
        .build()
    )
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_cmd))
    return application