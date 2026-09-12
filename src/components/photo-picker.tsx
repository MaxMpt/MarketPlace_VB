import { Plus, X } from "lucide-react";

const MAX_PHOTOS = 6;
const MAX_EDGE = 960;

async function fileToJpeg(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

export function PhotoPicker({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  async function onFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    const files = [...list].filter((f) => f.type.startsWith("image/")).slice(0, room);
    const next: string[] = [];
    for (const file of files) {
      try {
        next.push(await fileToJpeg(file));
      } catch {
        /* skip unreadable */
      }
    }
    if (next.length) onChange([...photos, ...next]);
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted">Фото</p>
      <p className="mt-0.5 text-xs text-subtle">До {MAX_PHOTOS} снимков — они будут на карточке</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {photos.map((src, index) => (
          <div key={`${index}-${src.slice(-12)}`} className="relative size-20 overflow-hidden rounded-lg bg-bg">
            <img src={src} alt="" className="size-full object-cover" />
            <button
              type="button"
              aria-label="Убрать фото"
              onClick={() => onChange(photos.filter((_, i) => i !== index))}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-fg/80 text-bg"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS ? (
          <label className="grid size-20 cursor-pointer place-items-center rounded-lg bg-bg text-muted">
            <Plus size={22} />
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                void onFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
          </label>
        ) : null}
      </div>
    </div>
  );
}
