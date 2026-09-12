import { useEffect } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SessionProvider } from "@/lib/session";
import { bootTelegram } from "@/lib/telegram";
import appCss from "../styles.css?url";

const APP_NAME = "ВБ2 Каталог";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no",
      },
      { title: APP_NAME },
      { name: "theme-color", content: "#ffffff" },
      {
        name: "description",
        content: "Услуги жителей и компании Восточного Бутово 2",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
    scripts: [{ src: "https://telegram.org/js/telegram-web-app.js" }],
  }),
  component: Root,
});

function Root() {
  return (
    <html lang="ru" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <PreviewHostBridge />
        <AuthProvider>
          <SessionProvider>
            <TelegramBoot />
            <Outlet />
          </SessionProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function TelegramBoot() {
  useEffect(() => bootTelegram(), []);
  return null;
}
