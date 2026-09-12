import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhotoPicker } from "@/components/photo-picker";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { addCompany, addService, listCategories } from "@/lib/catalog";
import { useSession } from "@/lib/session";
import { haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/add")({
  loader: () => listCategories(),
  component: AddPage,
});

function AddPage() {
  const categories = Route.useLoaderData();
  const navigate = useNavigate();
  const { user } = useSession();
  const [kind, setKind] = useState<"service" | "company">("service");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(categories[0]?.id ?? null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (name.trim().length < 2) {
      setError("Название слишком короткое");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (kind === "service") {
        if (!categoryId) throw new Error("Категория");
        const { id } = await addService({
          data: { user, categoryId, name, description, priceNote, photos },
        });
        haptic("success");
        await navigate({ to: "/services/$id", params: { id: String(id) } });
      } else {
        const { id } = await addCompany({ data: { user, name, description, photos } });
        haptic("success");
        await navigate({ to: "/companies/$id", params: { id: String(id) } });
      }
    } catch {
      haptic("error");
      setError("Не удалось сохранить.");
      setBusy(false);
    }
  }

  return (
    <Shell title="Новая карточка" backTo="/">
      <div className="px-4 pt-4">
        <div className="flex rounded-xl bg-bg p-1">
          <button
            type="button"
            onClick={() => {
              haptic("select");
              setKind("service");
            }}
            className={cn(
              "h-11 flex-1 rounded-lg text-sm font-medium",
              kind === "service" ? "bg-surface text-fg shadow-card" : "text-muted",
            )}
          >
            Услуга
          </button>
          <button
            type="button"
            onClick={() => {
              haptic("select");
              setKind("company");
            }}
            className={cn(
              "h-11 flex-1 rounded-lg text-sm font-medium",
              kind === "company" ? "bg-surface text-fg shadow-card" : "text-muted",
            )}
          >
            Компания
          </button>
        </div>

        <label className="mt-5 block text-xs font-medium text-muted" htmlFor="name">
          Название
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 h-11 w-full rounded-md bg-bg px-3 text-base shadow-card outline-none ring-primary/30 focus:ring-2"
          placeholder={kind === "service" ? "Маникюр у дома" : "Аптека у дома"}
        />

        {kind === "service" ? (
          <>
            <p className="mt-4 text-xs font-medium text-muted">Категория</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    haptic("select");
                    setCategoryId(c.id);
                  }}
                  className={cn(
                    "h-11 rounded-full px-3.5 text-sm font-medium",
                    categoryId === c.id ? "bg-primary text-primary-fg" : "bg-bg text-fg",
                  )}
                >
                  {c.title}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs font-medium text-muted" htmlFor="price">
              Цена
            </label>
            <input
              id="price"
              value={priceNote}
              onChange={(e) => setPriceNote(e.target.value)}
              className="mt-1 h-11 w-full rounded-md bg-bg px-3 text-base shadow-card outline-none ring-primary/30 focus:ring-2"
              placeholder="от 1 500 ₽"
            />
          </>
        ) : null}

        <label className="mt-4 block text-xs font-medium text-muted" htmlFor="desc">
          Описание
        </label>
        <textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full resize-none rounded-md bg-bg px-3 py-2 text-base shadow-card outline-none ring-primary/30 focus:ring-2"
        />

        <div className="mt-4">
          <PhotoPicker photos={photos} onChange={setPhotos} />
        </div>

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <Button type="button" className="mt-5 w-full" disabled={busy} onClick={() => void submit()}>
          {busy ? "Сохраняем…" : "Опубликовать"}
        </Button>
      </div>
    </Shell>
  );
}
