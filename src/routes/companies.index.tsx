import { createFileRoute } from "@tanstack/react-router";
import { ListingCard } from "@/components/listing-card";
import { Shell } from "@/components/shell";
import { listCompanies } from "@/lib/catalog";

export const Route = createFileRoute("/companies/")({
  loader: () => listCompanies(),
  component: CompaniesPage,
});

function CompaniesPage() {
  const companies = Route.useLoaderData();

  return (
    <Shell title="Компании района">
      <p className="px-4 pt-4 text-sm text-muted">Магазины, аптеки, кружки рядом с домом</p>
      <div className="mt-4 flex flex-col gap-3 px-4">
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
    </Shell>
  );
}
