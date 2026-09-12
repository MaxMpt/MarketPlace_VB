import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSettings, saveSettings, upsertTelegramUser, type AppSettings } from "@/lib/catalog";
import { getTelegram, getTelegramUser, type TelegramUser } from "@/lib/telegram";

type Theme = AppSettings["theme"];

type SessionValue = {
  user: TelegramUser;
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

function readLocalTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("vb2-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem("vb2-theme", theme);
  const tg = getTelegram();
  const header = theme === "dark" ? "#1c1c1e" : "#ffffff";
  const bg = theme === "dark" ? "#000000" : "#ffffff";
  tg?.setHeaderColor?.(header);
  tg?.setBackgroundColor?.(bg);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", header);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser>(() => getTelegramUser());
  const [theme, setThemeState] = useState<Theme>(readLocalTheme);

  useEffect(() => {
    setUser(getTelegramUser());
    applyTheme(readLocalTheme());
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await upsertTelegramUser({ data: user });
        const stored = await getSettings({ data: { userId: user.id } });
        if (!cancelled) setThemeState(stored.theme);
      } catch {
        /* schema not ready */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      applyTheme(next);
      void saveSettings({ data: { userId: user.id, user, theme: next } });
    },
    [user],
  );

  const value = useMemo(() => ({ user, theme, setTheme }), [user, theme, setTheme]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("SessionProvider");
  return ctx;
}
