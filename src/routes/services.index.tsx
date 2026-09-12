import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { z } from "zod";
import { ListingCard } from "@/components/listing-card";
import { Shell } from "@/components/shell";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { listCategories, listServices } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  cat: z.string().optional(),
});

export const Route = createFileRoute("/services/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ cat: search.cat }),
  loader: async ({ deps }) => {
    const [categories, services] = await Promise.all([
      listCategories(),
      listServices({ data: { slug: deps.cat } }),
    ]);
    return { categories, services };
  },
  component: ServicesPage,
});

function ServicesPage() {
  const { categories, services } = Route.useLoaderData();
  const { cat } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <Shell title="Услуги жителей">
      <div className="sticky top-0 z-10 bg-surface/95 px-4 pb-2 pt-3 backdrop-blur-sm">
        <p className="text-sm text-muted">Объявления соседей по двору</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={!cat} label="Все" onClick={() => navigate({ search: { cat: undefined } })} />
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug];
            return (
              <Chip
                key={c.id}
                active={cat === c.slug}
                label={c.title}
                icon={Icon ? <Icon size={14} /> : null}
                onClick={() =>
                  navigate({ search: { cat: cat === c.slug ? undefined : c.slug } })
                }
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 px-4">
        {services.length === 0 ? (
          <p className="rounded-xl bg-bg px-4 py-8 text-center text-sm text-muted">
            В этой категории пока пусто.
          </p>
        ) : (
          services.map((s) => (
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
          ))
        )}
      </div>
    </Shell>
  );
}

function Chip({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium",
        active ? "bg-primary text-primary-fg" : "bg-bg text-fg",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
