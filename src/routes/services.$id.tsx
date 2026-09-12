import { createFileRoute, notFound } from "@tanstack/react-router";
import { PhotoCarousel } from "@/components/photo-carousel";
import { ReviewForm } from "@/components/review-form";
import { Shell } from "@/components/shell";
import { Stars } from "@/components/stars";
import { getService } from "@/lib/catalog";
import { formatPrice, formatRating } from "@/lib/utils";

export const Route = createFileRoute("/services/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) throw notFound();
    const data = await getService({ data: { id } });
    if (!data) throw notFound();
    return data;
  },
  component: ServicePage,
});

function ServicePage() {
  const { service, photos, reviews } = Route.useLoaderData();

  return (
    <Shell title={service.name} backTo="/services">
      <PhotoCarousel photos={photos} />

      <div className="px-4 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {service.category_title}
          {service.author ? ` · ${service.author}` : ""}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{service.name}</h2>
        <div className="mt-2 flex items-center gap-2">
          <Stars value={service.rating_value} />
          <span className="text-sm tabular-nums text-muted">
            {service.rating_count > 0
              ? `${formatRating(service.rating_value)} · ${service.rating_count}`
              : "пока нет оценок"}
          </span>
        </div>
        <p className="mt-2 text-base font-semibold tabular-nums">
          {formatPrice(service.price_cents, service.price_note)}
        </p>
        {service.description ? (
          <p className="mt-3 text-[15px] leading-relaxed text-fg">{service.description}</p>
        ) : null}
      </div>

      <section className="mt-8 px-4">
        <h3 className="text-base font-semibold">Отзывы</h3>
        <div className="mt-3 flex flex-col gap-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted">Пока никто не написал.</p>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="rounded-xl bg-bg p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{r.author_name}</p>
                  <Stars value={r.rating} size={12} />
                </div>
                {r.review_text ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-fg">{r.review_text}</p>
                ) : null}
                {r.photos[0] ? (
                  <img
                    src={r.photos[0].image_url}
                    alt=""
                    className="mt-2 h-36 w-full rounded-lg object-cover"
                  />
                ) : null}
              </article>
            ))
          )}
        </div>
        <div className="mt-4">
          <ReviewForm serviceId={service.id} />
        </div>
      </section>
    </Shell>
  );
}
