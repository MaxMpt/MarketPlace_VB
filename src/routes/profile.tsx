import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { Shell } from "@/components/shell";
import { Stars } from "@/components/stars";
import { getResidentProfile, type CompanyCard, type MyReview, type ServiceCard } from "@/lib/catalog";
import { useSession } from "@/lib/session";
import { displayName } from "@/lib/telegram";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, theme, setTheme } = useSession();
  const [listings, setListings] = useState<ServiceCard[]>([]);
  const [companies, setCompanies] = useState<CompanyCard[]>([]);
  const [reviews, setReviews] = useState<MyReview[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getResidentProfile({ data: { userId: user.id } }).then((data) => {
      if (cancelled) return;
      setListings(data.listings);
      setCompanies(data.companies);
      setReviews(data.reviews);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <Shell title="Профиль">
      <div className="px-4 pt-5">
        <div className="flex gap-4">
          <img
            src={user.photoUrl || "/photos/avatar.gif"}
            alt=""
            className="size-20 rounded-xl bg-fg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold tracking-tight">{displayName(user)}</p>
            {user.username ? (
              <p className="mt-0.5 text-sm font-medium text-primary">@{user.username}</p>
            ) : (
              <p className="mt-0.5 text-sm text-muted">имя из Telegram</p>
            )}
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted">
              <MapPin size={12} />
              Восточное Бутово 2
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Stat label="Мои объявления" value={listings.length + companies.length} />
          <Stat label="Мои отзывы" value={reviews.length} />
        </div>

        <Link
          to="/add"
          className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-fg"
        >
          <Plus size={18} />
          Новая карточка
        </Link>
      </div>

      <section className="mt-8 px-4">
        <h3 className="text-base font-semibold">Настройки</h3>
        <div className="mt-3 overflow-hidden rounded-xl bg-bg">
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <div>
              <p className="text-sm font-medium">Тёмная тема</p>
              <p className="text-xs text-muted">сохраняется только для вас</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "relative h-8 w-14 shrink-0 rounded-full transition-colors",
                theme === "dark" ? "bg-primary" : "bg-subtle/40",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 size-6 rounded-full bg-surface shadow-card transition-transform",
                  theme === "dark" && "translate-x-6",
                )}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 px-4">
        <h3 className="text-base font-semibold">Мои услуги</h3>
        <div className="mt-3 flex flex-col gap-3">
          {listings.length === 0 ? (
            <p className="rounded-xl bg-bg px-4 py-6 text-sm text-muted">
              Пока нет объявлений. Нажмите «Новая карточка», если оказываете услугу соседям.
            </p>
          ) : (
            listings.map((s) => (
              <ListingCard
                key={s.id}
                kind="service"
                id={s.id}
                image={s.cover}
                title={s.name}
                subtitle={s.category_title}
                rating={s.rating_value}
                count={s.rating_count}
                priceCents={s.price_cents}
                priceNote={s.price_note}
              />
            ))
          )}
        </div>
      </section>

      {companies.length > 0 ? (
        <section className="mt-8 px-4">
          <h3 className="text-base font-semibold">Мои компании</h3>
          <div className="mt-3 flex flex-col gap-3">
            {companies.map((c) => (
              <ListingCard
                key={c.id}
                kind="company"
                id={c.id}
                image={c.cover}
                title={c.name}
                subtitle={c.description}
                rating={c.rating_value}
                count={c.rating_count}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 px-4 pb-2">
        <h3 className="text-base font-semibold">Мои отзывы</h3>
        <div className="mt-3 flex flex-col gap-3">
          {reviews.length === 0 ? (
            <p className="rounded-xl bg-bg px-4 py-6 text-sm text-muted">
              Оцените услугу или компанию — отзыв появится здесь.
            </p>
          ) : (
            reviews.map((r) => (
              <Link
                key={r.id}
                to={r.kind === "service" ? "/services/$id" : "/companies/$id"}
                params={{ id: String(r.target_id) }}
                className="block rounded-xl bg-bg p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{r.target_name}</p>
                  <Stars value={r.rating} size={12} />
                </div>
                {r.review_text ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-fg">{r.review_text}</p>
                ) : null}
              </Link>
            ))
          )}
        </div>
      </section>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-bg px-4 py-3">
      <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
