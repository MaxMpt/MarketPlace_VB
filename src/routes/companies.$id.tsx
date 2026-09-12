import { createFileRoute, notFound } from "@tanstack/react-router";
import { PhotoCarousel } from "@/components/photo-carousel";
import { ReviewForm } from "@/components/review-form";
import { Shell } from "@/components/shell";
import { Stars } from "@/components/stars";
import { getCompany } from "@/lib/catalog";
import { formatRating } from "@/lib/utils";

export const Route = createFileRoute("/companies/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) throw notFound();
    const data = await getCompany({ data: { id } });
    if (!data) throw notFound();
    return data;
  },
  component: CompanyPage,
});

function CompanyPage() {
  const { company, photos, reviews } = Route.useLoaderData();

  return (
    <Shell title={company.name} backTo="/companies">
      <PhotoCarousel photos={photos} />
      <div className="px-4 pt-4">
        <h2 className="text-xl font-semibold tracking-tight">{company.name}</h2>
        <div className="mt-2 flex items-center gap-2">
          <Stars value={company.rating_value} />
          <span className="text-sm tabular-nums text-muted">
            {company.rating_count > 0
              ? `${formatRating(company.rating_value)} · ${company.rating_count}`
              : "пока нет оценок"}
          </span>
        </div>
        {company.description ? (
          <p className="mt-3 text-[15px] leading-relaxed">{company.description}</p>
        ) : null}
      </div>

      <section className="mt-8 px-4">
        <h3 className="text-base font-semibold">Отзывы</h3>
        <div className="mt-3 flex flex-col gap-3">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-xl bg-bg p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{r.author_name}</p>
                <Stars value={r.rating} size={12} />
              </div>
              {r.review_text ? (
                <p className="mt-1.5 text-sm leading-relaxed">{r.review_text}</p>
              ) : null}
            </article>
          ))}
        </div>
        <div className="mt-4">
          <ReviewForm companyId={company.id} />
        </div>
      </section>
    </Shell>
  );
}
