import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PhotoCarousel({ photos }: { photos: { id: number; image_url: string }[] }) {
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const thumbs = thumbsRef.current;
    const active = thumbs?.children[index] as HTMLElement | undefined;
    if (!thumbs || !active) return;
    thumbs.scrollTo({
      left: active.offsetLeft - thumbs.clientWidth / 2 + active.clientWidth / 2,
      behavior: "smooth",
    });
  }, [index]);

  if (photos.length === 0) return null;

  function onScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.min(photos.length - 1, Math.max(0, next)));
  }

  function go(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndex(i);
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.image_url}
              alt=""
              draggable={false}
              className="h-full w-full shrink-0 snap-center object-cover"
            />
          ))}
        </div>
        {photos.length > 1 ? (
          <p className="absolute right-3 bottom-3 rounded-full bg-fg/70 px-2 py-0.5 text-[11px] font-medium tabular-nums text-bg">
            {index + 1} / {photos.length}
          </p>
        ) : null}
      </div>

      {photos.length > 1 ? (
        <div
          ref={thumbsRef}
          className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => go(i)}
              aria-current={i === index}
              aria-label={`Фото ${i + 1}`}
              className={cn(
                "h-16 w-20 shrink-0 overflow-hidden rounded-lg",
                i === index ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : "opacity-55",
              )}
            >
              <img src={photo.image_url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
