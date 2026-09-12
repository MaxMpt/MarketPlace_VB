import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Briefcase, Building2, ChevronRight, Plus } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { Shell } from "@/components/shell";
import { getHome } from "@/lib/catalog";
import { CATEGORY_ICONS } from "@/lib/category-icons";

export const Route = createFileRoute("/")({
  loader: () => getHome(),
  component: StartPage,
});

function StartPage() {
  const { categories, services, companies, serviceCount, companyCount } = Route.useLoaderData();

  return (
    <Shell title="ВБ2 Каталог">
      <div className="relative">
        <img
          src="/photos/courtyard-vb2.jpg"
          alt=""
          className="h-52 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">
            Восточное Бутово 2
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Каталог двора</h2>
          <p className="mt-1 max-w-xs text-sm leading-snug text-white/85">
            Услуги жителей и компании рядом с домом. Отзывы соседей — без ленты сообщений.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <Shortcut
          to="/services"
          icon={<Briefcase size={20} />}
          title="Услуги"
          hint={`${serviceCount} объявлений`}
        />
        <Shortcut
          to="/companies"
          icon={<Building2 size={20} />}
          title="Компании"
          hint={`${companyCount} рядом`}
        />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          const Icon = CATEGORY_ICONS[c.slug];
          return (
            <Link
              key={c.id}
              to="/services"
              search={{ cat: c.slug }}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-bg px-3.5 text-sm font-medium text-fg"
            >
              {Icon ? <Icon size={14} /> : null}
              {c.title}
            </Link>
          );
        })}
      </div>

      <section className="mt-6 px-4">
        <SectionHead title="С высоким рейтингом" to="/services" />
        <div className="mt-3 flex flex-col gap-3">
          {services.map((s) => (
            <ListingCard
              key={s.id}
              kind="service"
              id={s.id}
              image={s.cover}
              title={s.name}
              subtitle={`${s.category_title}${s.author ? ` · ${s.author}` : ""}`}
              rating={s.rating_value}
              count={s.rating_count}
              priceCents={s.price_cents}
              priceNote={s.price_note}
            />
          ))}
        </div>
      </section>

      <section className="mt-6 px-4">
        <SectionHead title="Компании у дома" to="/companies" />
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

      <div className="px-4 pb-2 pt-6">
        <Link
          to="/add"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-fg"
        >
          <Plus size={18} />
          Разместить объявление
        </Link>
      </div>
    </Shell>
  );
}

function Shortcut({
  to,
  icon,
  title,
  hint,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Link to={to} className="rounded-xl bg-bg p-4 shadow-card">
      <div className="grid size-9 place-items-center rounded-md bg-surface text-primary">{icon}</div>
      <p className="mt-3 text-[15px] font-semibold">{title}</p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
    </Link>
  );
}

function SectionHead({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold">{title}</h3>
      <Link to={to} className="inline-flex items-center text-sm font-medium text-primary">
        Все
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
