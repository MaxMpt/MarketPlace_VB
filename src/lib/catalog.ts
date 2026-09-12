import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

export type Category = { id: number; slug: string; title: string; sort_order: number };
export type Photo = { id: number; image_url: string; sort_order: number };
export type Review = {
  id: number;
  rating: number;
  review_text: string | null;
  author_name: string;
  create_date: string;
  photos: Photo[];
};
export type ServiceCard = {
  id: number;
  name: string;
  description: string | null;
  price_cents: number | null;
  price_note: string | null;
  rating_value: number;
  rating_count: number;
  author: string | null;
  category_id: number;
  category_title: string;
  category_slug: string;
  cover: string | null;
};
export type CompanyCard = {
  id: number;
  name: string;
  description: string | null;
  rating_value: number;
  rating_count: number;
  cover: string | null;
};
export type MyReview = {
  id: number;
  rating: number;
  review_text: string | null;
  target_name: string;
  kind: "service" | "company";
  target_id: number;
};
export type AppSettings = { theme: "light" | "dark" };

const telegramUserSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string().min(1).max(255),
  lastName: z.string().max(255).optional(),
  username: z.string().max(32).optional(),
  photoUrl: z.string().max(2000).optional(),
});

const photoDataSchema = z.string().min(8).max(900_000);

function num(v: unknown) {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function ensureUser(
  sql: Awaited<ReturnType<typeof getSql>>,
  user: z.infer<typeof telegramUserSchema>,
) {
  await sql.query(
    `insert into users (id, username, first_name, last_name, photo_url)
     values ($1, $2, $3, $4, $5)
     on conflict (id) do update set
       username = excluded.username,
       first_name = excluded.first_name,
       last_name = excluded.last_name,
       photo_url = coalesce(excluded.photo_url, users.photo_url)`,
    [
      user.id,
      user.username ?? null,
      user.firstName,
      user.lastName ?? null,
      user.photoUrl ?? null,
    ],
  );
}

async function insertPhotos(
  sql: Awaited<ReturnType<typeof getSql>>,
  owner: { serviceId?: number; companyId?: number },
  photos: string[],
) {
  for (let i = 0; i < photos.length; i += 1) {
    await sql.query(
      `insert into photos (service_id, company_id, image_url, sort_order)
       values ($1, $2, $3, $4)`,
      [owner.serviceId ?? null, owner.companyId ?? null, photos[i], i],
    );
  }
}

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<Category>`
    select id, slug, title, sort_order
    from service_categories
    where deleted_at is null
    order by sort_order, id
  `;
});

export const listServices = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().optional() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      `select
         s.id, s.name, s.description, s.price_cents, s.price_note,
         s.rating_value::float8 as rating_value, s.rating_count,
         s.category_id, c.title as category_title, c.slug as category_slug,
         u.first_name as author,
         (select p.image_url from photos p
           where p.service_id = s.id and p.deleted_at is null
           order by p.sort_order, p.id limit 1) as cover
       from services s
       join service_categories c on c.id = s.category_id
       left join users u on u.id = s.create_user
       where s.deleted_at is null
         and ($1::text is null or c.slug = $1)
       order by s.rating_value desc, s.id`,
      [data.slug ?? null],
    );
    return rows.map((r) => ({
      ...r,
      rating_value: num(r.rating_value),
      rating_count: num(r.rating_count),
      price_cents: r.price_cents == null ? null : num(r.price_cents),
    })) as ServiceCard[];
  });

export const getService = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const [service] = await sql.query<Record<string, unknown>>(
      `select
         s.id, s.name, s.description, s.price_cents, s.price_note,
         s.rating_value::float8 as rating_value, s.rating_count,
         s.category_id, c.title as category_title, c.slug as category_slug,
         u.first_name as author
       from services s
       join service_categories c on c.id = s.category_id
       left join users u on u.id = s.create_user
       where s.id = $1 and s.deleted_at is null`,
      [data.id],
    );
    if (!service) return null;
    const photos = await sql.query<Photo>(
      `select id, image_url, sort_order from photos
       where service_id = $1 and deleted_at is null
       order by sort_order, id`,
      [data.id],
    );
    const reviewRows = await sql.query<Record<string, unknown>>(
      `select id, rating, review_text, author_name, create_date::text as create_date
       from rating_reviews
       where service_id = $1 and deleted_at is null
       order by create_date desc`,
      [data.id],
    );
    const reviewIds = reviewRows.map((r) => Number(r.id));
    const reviewPhotos =
      reviewIds.length === 0
        ? []
        : await sql.query<Photo & { review_id: number }>(
            `select id, review_id, image_url, sort_order from photos
             where deleted_at is null and review_id in (${reviewIds.map((_, i) => `$${i + 1}`).join(",")})
             order by sort_order, id`,
            reviewIds,
          );
    const byReview = new Map<number, Photo[]>();
    for (const p of reviewPhotos) {
      const list = byReview.get(p.review_id) ?? [];
      list.push(p);
      byReview.set(p.review_id, list);
    }
    const reviews: Review[] = reviewRows.map((r) => ({
      id: Number(r.id),
      rating: num(r.rating),
      review_text: (r.review_text as string) ?? null,
      author_name: String(r.author_name),
      create_date: String(r.create_date),
      photos: byReview.get(Number(r.id)) ?? [],
    }));
    return {
      service: {
        ...service,
        rating_value: num(service.rating_value),
        rating_count: num(service.rating_count),
        price_cents: service.price_cents == null ? null : num(service.price_cents),
        cover: photos[0]?.image_url ?? null,
      } as ServiceCard,
      photos,
      reviews,
    };
  });

export const listCompanies = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select
       c.id, c.name, c.description,
       c.rating_value::float8 as rating_value, c.rating_count,
       (select p.image_url from photos p
         where p.company_id = c.id and p.deleted_at is null
         order by p.sort_order, p.id limit 1) as cover
     from companies c
     where c.deleted_at is null
     order by c.rating_value desc, c.id`,
  );
  return rows.map((r) => ({
    ...r,
    rating_value: num(r.rating_value),
    rating_count: num(r.rating_count),
  })) as CompanyCard[];
});

export const getCompany = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const [company] = await sql.query<Record<string, unknown>>(
      `select id, name, description,
              rating_value::float8 as rating_value, rating_count
       from companies where id = $1 and deleted_at is null`,
      [data.id],
    );
    if (!company) return null;
    const photos = await sql.query<Photo>(
      `select id, image_url, sort_order from photos
       where company_id = $1 and deleted_at is null
       order by sort_order, id`,
      [data.id],
    );
    const reviewRows = await sql.query<Record<string, unknown>>(
      `select id, rating, review_text, author_name, create_date::text as create_date
       from rating_reviews
       where company_id = $1 and deleted_at is null
       order by create_date desc`,
      [data.id],
    );
    const reviews: Review[] = reviewRows.map((r) => ({
      id: Number(r.id),
      rating: num(r.rating),
      review_text: (r.review_text as string) ?? null,
      author_name: String(r.author_name),
      create_date: String(r.create_date),
      photos: [],
    }));
    return {
      company: {
        ...company,
        rating_value: num(company.rating_value),
        rating_count: num(company.rating_count),
        cover: photos[0]?.image_url ?? null,
      } as CompanyCard,
      photos,
      reviews,
    };
  });

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const [categories, services, companies] = await Promise.all([
    listCategories(),
    listServices({ data: {} }),
    listCompanies(),
  ]);
  return {
    categories,
    services: services.slice(0, 3),
    companies: companies.slice(0, 2),
    serviceCount: services.length,
    companyCount: companies.length,
  };
});

export const getResidentProfile = createServerFn({ method: "GET" })
  .validator(z.object({ userId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const listings = await sql.query<Record<string, unknown>>(
      `select
         s.id, s.name, s.description, s.price_cents, s.price_note,
         s.rating_value::float8 as rating_value, s.rating_count,
         s.category_id, c.title as category_title, c.slug as category_slug,
         u.first_name as author,
         (select p.image_url from photos p
           where p.service_id = s.id and p.deleted_at is null
           order by p.sort_order, p.id limit 1) as cover
       from services s
       join service_categories c on c.id = s.category_id
       left join users u on u.id = s.create_user
       where s.deleted_at is null and s.create_user = $1
       order by s.created_at desc`,
      [data.userId],
    );
    const companyListings = await sql.query<Record<string, unknown>>(
      `select
         c.id, c.name, c.description,
         c.rating_value::float8 as rating_value, c.rating_count,
         (select p.image_url from photos p
           where p.company_id = c.id and p.deleted_at is null
           order by p.sort_order, p.id limit 1) as cover
       from companies c
       where c.deleted_at is null and c.create_user = $1
       order by c.created_at desc`,
      [data.userId],
    );
    const reviews = await sql.query<Record<string, unknown>>(
      `select
         r.id, r.rating, r.review_text,
         coalesce(s.name, co.name) as target_name,
         case when r.service_id is not null then 'service' else 'company' end as kind,
         coalesce(r.service_id, r.company_id) as target_id
       from rating_reviews r
       left join services s on s.id = r.service_id
       left join companies co on co.id = r.company_id
       where r.deleted_at is null and r.create_user = $1
       order by r.create_date desc`,
      [data.userId],
    );
    return {
      listings: listings.map((r) => ({
        ...r,
        rating_value: num(r.rating_value),
        rating_count: num(r.rating_count),
        price_cents: r.price_cents == null ? null : num(r.price_cents),
      })) as ServiceCard[],
      companies: companyListings.map((r) => ({
        ...r,
        rating_value: num(r.rating_value),
        rating_count: num(r.rating_count),
      })) as CompanyCard[],
      reviews: reviews.map((r) => ({
        id: Number(r.id),
        rating: num(r.rating),
        review_text: (r.review_text as string) ?? null,
        target_name: String(r.target_name ?? ""),
        kind: r.kind as "service" | "company",
        target_id: Number(r.target_id),
      })) as MyReview[],
    };
  });

export const addReview = createServerFn({ method: "POST" })
  .validator(
    z.object({
      user: telegramUserSchema,
      serviceId: z.number().optional(),
      companyId: z.number().optional(),
      rating: z.number().int().min(1).max(5),
      text: z.string().max(800),
    }),
  )
  .handler(async ({ data }) => {
    if (!data.serviceId && !data.companyId) throw new Error("Нужна карточка");
    if (data.serviceId && data.companyId) throw new Error("Один объект");
    const sql = await getSql();
    await ensureUser(sql, data.user);
    const author = [data.user.firstName, data.user.lastName].filter(Boolean).join(" ");
    await sql.query(
      `insert into rating_reviews (service_id, company_id, create_user, author_name, rating, review_text)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        data.serviceId ?? null,
        data.companyId ?? null,
        data.user.id,
        author,
        data.rating,
        data.text.trim() || null,
      ],
    );
    if (data.serviceId) {
      await sql.query(
        `update services s set
           rating_count = sub.cnt,
           rating_value = sub.avg
         from (
           select count(*)::int as cnt,
                  coalesce(round(avg(rating)::numeric, 2), 0) as avg
           from rating_reviews
           where service_id = $1 and deleted_at is null
         ) sub
         where s.id = $1`,
        [data.serviceId],
      );
    } else if (data.companyId) {
      await sql.query(
        `update companies c set
           rating_count = sub.cnt,
           rating_value = sub.avg
         from (
           select count(*)::int as cnt,
                  coalesce(round(avg(rating)::numeric, 2), 0) as avg
           from rating_reviews
           where company_id = $1 and deleted_at is null
         ) sub
         where c.id = $1`,
        [data.companyId],
      );
    }
    return { ok: true };
  });

export const addService = createServerFn({ method: "POST" })
  .validator(
    z.object({
      user: telegramUserSchema,
      categoryId: z.number(),
      name: z.string().min(2).max(80),
      description: z.string().max(600),
      priceNote: z.string().max(40),
      photos: z.array(photoDataSchema).max(6),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureUser(sql, data.user);
    const rows = await sql.query<{ id: number }>(
      `insert into services (category_id, name, description, price_note, create_user)
       values ($1, $2, $3, $4, $5)
       returning id`,
      [
        data.categoryId,
        data.name.trim(),
        data.description.trim() || null,
        data.priceNote.trim() || null,
        data.user.id,
      ],
    );
    const id = Number(rows[0].id);
    await insertPhotos(sql, { serviceId: id }, data.photos);
    return { id };
  });

export const addCompany = createServerFn({ method: "POST" })
  .validator(
    z.object({
      user: telegramUserSchema,
      name: z.string().min(2).max(80),
      description: z.string().max(600),
      photos: z.array(photoDataSchema).max(6),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureUser(sql, data.user);
    const rows = await sql.query<{ id: number }>(
      `insert into companies (name, description, create_user)
       values ($1, $2, $3)
       returning id`,
      [data.name.trim(), data.description.trim() || null, data.user.id],
    );
    const id = Number(rows[0].id);
    await insertPhotos(sql, { companyId: id }, data.photos);
    return { id };
  });

export const upsertTelegramUser = createServerFn({ method: "POST" })
  .validator(telegramUserSchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureUser(sql, data);
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" })
  .validator(z.object({ userId: z.number().int().positive() }))
  .handler(async ({ data }): Promise<AppSettings> => {
    const sql = await getSql();
    const rows = await sql.query<{ theme: string }>(
      `select theme from user_settings where user_id = $1`,
      [data.userId],
    );
    return { theme: rows[0]?.theme === "dark" ? "dark" : "light" };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.number().int().positive(),
      user: telegramUserSchema,
      theme: z.enum(["light", "dark"]),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureUser(sql, data.user);
    await sql.query(
      `insert into user_settings (user_id, theme, updated_at)
       values ($1, $2, now())
       on conflict (user_id) do update set
         theme = excluded.theme,
         updated_at = now()`,
      [data.userId, data.theme],
    );
    return { ok: true };
  });
