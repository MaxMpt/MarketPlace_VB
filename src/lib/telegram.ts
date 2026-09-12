export type TelegramUser = {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
};

type Insets = { top: number; bottom: number; left: number; right: number };

type TgUserRaw = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export type TgWebApp = {
  ready: () => void;
  expand: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  viewportStableHeight?: number;
  viewportHeight?: number;
  isExpanded?: boolean;
  initData?: string;
  initDataUnsafe?: { user?: TgUserRaw };
  platform?: string;
  safeAreaInset?: Insets;
  contentSafeAreaInset?: Insets;
  onEvent?: (event: string, cb: (...args: unknown[]) => void) => void;
  offEvent?: (event: string, cb: (...args: unknown[]) => void) => void;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
};

export function getTelegram(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
}

export function isTelegramApp() {
  const tg = getTelegram();
  if (!tg) return false;
  if (tg.initData) return true;
  const platform = (tg.platform || "").toLowerCase();
  return platform === "ios" || platform === "android" || platform === "android_x";
}

export function getTelegramUser(): TelegramUser {
  const raw = getTelegram()?.initDataUnsafe?.user;
  if (raw && Number.isFinite(raw.id)) {
    return {
      id: raw.id,
      firstName: raw.first_name?.trim() || "Житель",
      lastName: raw.last_name?.trim() || undefined,
      username: raw.username?.trim() || undefined,
      photoUrl: raw.photo_url || undefined,
    };
  }
  return {
    id: 1,
    firstName: "Даниил",
    username: "open_url",
    photoUrl: "/photos/avatar.gif",
  };
}

export function displayName(user: TelegramUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

export function haptic(kind: "light" | "success" | "error" | "select" = "light") {
  const feedback = getTelegram()?.HapticFeedback;
  if (feedback && isTelegramApp()) {
    try {
      if (kind === "success") feedback.notificationOccurred("success");
      else if (kind === "error") feedback.notificationOccurred("error");
      else if (kind === "select") feedback.selectionChanged();
      else feedback.impactOccurred("medium");
    } catch {
      /* older clients */
    }
    return;
  }
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(kind === "success" ? 24 : 10);
  }
}

function setVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function applyLayout() {
  const tg = getTelegram();
  const visual = window.visualViewport?.height ?? 0;
  const inner = window.innerHeight ?? 0;
  let height = Math.max(visual, inner, 1);

  if (tg && isTelegramApp()) {
    if (tg.isExpanded === false) tg.expand();
    const stable = tg.viewportStableHeight || tg.viewportHeight || 0;
    if (tg.isExpanded && stable > 0) height = stable;
    const top = tg.contentSafeAreaInset?.top ?? tg.safeAreaInset?.top ?? 0;
    const bottom = tg.safeAreaInset?.bottom ?? 0;
    setVar("--tg-safe-top", `${Math.max(0, top)}px`);
    setVar("--tg-safe-bottom", `${Math.max(0, bottom)}px`);
  } else {
    setVar("--tg-safe-top", "0px");
    setVar("--tg-safe-bottom", "env(safe-area-inset-bottom, 0px)");
  }

  setVar("--app-height", `${Math.round(height)}px`);
}

function applyTelegramChrome(tg: TgWebApp) {
  tg.ready();
  tg.expand();
  if (isTelegramApp()) {
    tg.disableVerticalSwipes?.();
    const dark = document.documentElement.classList.contains("dark");
    tg.setHeaderColor?.(dark ? "#1c1c1e" : "#ffffff");
    tg.setBackgroundColor?.(dark ? "#000000" : "#ffffff");
  }
  applyLayout();
  const onViewport = () => applyLayout();
  tg.onEvent?.("viewportChanged", onViewport);
  tg.onEvent?.("safeAreaChanged", onViewport);
  tg.onEvent?.("contentSafeAreaChanged", onViewport);
  window.visualViewport?.addEventListener("resize", onViewport);
  window.addEventListener("resize", onViewport);
  return () => {
    tg.offEvent?.("viewportChanged", onViewport);
    tg.offEvent?.("safeAreaChanged", onViewport);
    tg.offEvent?.("contentSafeAreaChanged", onViewport);
    window.visualViewport?.removeEventListener("resize", onViewport);
    window.removeEventListener("resize", onViewport);
  };
}

function loadTelegramScript(): Promise<void> {
  if (getTelegram()) return Promise.resolve();
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="telegram-web-app.js"]',
    );
    const finish = () => resolve();
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      window.setTimeout(finish, 800);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = finish;
    script.onerror = finish;
    document.head.appendChild(script);
  });
}

export function bootTelegram() {
  applyLayout();
  let cleanup: (() => void) | undefined;
  let cancelled = false;
  void loadTelegramScript().then(() => {
    if (cancelled) return;
    const tg = getTelegram();
    if (tg) cleanup = applyTelegramChrome(tg);
  });
  return () => {
    cancelled = true;
    cleanup?.();
  };
}
