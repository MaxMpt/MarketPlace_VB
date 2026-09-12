import { Link } from "@tanstack/react-router";
import { Stars } from "@/components/stars";
import { formatPrice, formatRating } from "@/lib/utils";

export function ListingCard({
  kind,
  id,
  image,
  title,
  subtitle,
  rating,
  count,
  priceCents,
  priceNote,
}: {
  kind: "service" | "company";
  id: number;
  image: string | null;
  title: string;
  subtitle?: string | null;
  rating: number;
  count: number;
  priceCents?: number | null;
  priceNote?: string | null;
}) {
  return (
    <Link
      to={kind === "service" ? "/services/$id" : "/companies/$id"}
      params={{ id: String(id) }}
      className="flex w-full gap-3 rounded-xl bg-surface p-2 shadow-card"
    >
      <div className="size-[88px] shrink-0 overflow-hidden rounded-lg bg-bg">
        {image ? (
          <img src={image} alt="" className="pointer-events-none size-full object-cover" />
        ) : (
          <div className="size-full bg-bg" />
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="truncate text-[15px] font-semibold leading-snug">{title}</p>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p> : null}
        <div className="mt-1.5 flex items-center gap-1.5">
          <Stars value={rating} />
          <span className="text-xs tabular-nums text-muted">
            {count > 0 ? `${formatRating(rating)} · ${count}` : "пока нет оценок"}
          </span>
        </div>
        {priceCents !== undefined ? (
          <p className="mt-1 text-sm font-medium tabular-nums text-fg">
            {formatPrice(priceCents ?? null, priceNote ?? null)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
