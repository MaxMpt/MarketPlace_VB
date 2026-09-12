import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Briefcase, Building2, ChevronLeft, House, User } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { getTelegram, haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";

export function Shell({
  title,
  backTo,
  children,
}: {
  title: string;
  backTo?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const tab =
    pathname.startsWith("/companies")
      ? "companies"
      : pathname.startsWith("/services")
        ? "services"
        : pathname.startsWith("/profile")
          ? "profile"
          : "home";

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    const back = getTelegram()?.BackButton;
    if (!back) return;
    if (!backTo) {
      back.hide();
      return;
    }
    const onBack = () => {
      haptic("light");
      void navigate({ to: backTo });
    };
    back.show();
    back.onClick(onBack);
    return () => {
      back.offClick(onBack);
      back.hide();
    };
  }, [backTo, navigate]);

  return (
    <div className="app-shell mx-auto flex max-w-md flex-col bg-surface">
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-surface px-1">
        {backTo ? (
          <Link
            to={backTo}
            onClick={() => haptic("light")}
            className="grid size-11 place-items-center text-primary"
            aria-label="Назад"
          >
            <ChevronLeft size={22} />
          </Link>
        ) : (
          <div className="w-11" />
        )}
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold tracking-tight">
          {title}
        </h1>
        <div className="w-11" />
      </header>

      <main
        ref={mainRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
      >
        {children}
      </main>

      <nav className="shrink-0 border-t border-border bg-surface">
        <div className="flex h-14">
          <TabLink to="/" active={tab === "home"} icon={<House size={20} />} label="Главная" />
          <TabLink
            to="/services"
            active={tab === "services"}
            icon={<Briefcase size={20} />}
            label="Услуги"
          />
          <TabLink
            to="/companies"
            active={tab === "companies"}
            icon={<Building2 size={20} />}
            label="Компании"
          />
          <TabLink
            to="/profile"
            active={tab === "profile"}
            icon={<User size={20} />}
            label="Профиль"
          />
        </div>
      </nav>
    </div>
  );
}

function TabLink({
  to,
  active,
  icon,
  label,
}: {
  to: string;
  active: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      onClick={() => haptic("select")}
      className={cn(
        "flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
        active ? "text-primary" : "text-subtle",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
