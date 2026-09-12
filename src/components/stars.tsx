import { Star } from "lucide-react";
import { haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  size = 14,
  onPick,
}: {
  value: number;
  size?: number;
  onPick?: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const icon = (
          <Star
            key={n}
            size={size}
            className={cn(
              filled ? "fill-star text-star" : "text-border",
              "transition-[fill,color,transform] duration-150 ease-out",
            )}
            strokeWidth={1.6}
          />
        );
        if (!onPick) return icon;
        return (
          <button
            key={n}
            type="button"
            onPointerDown={() => haptic("select")}
            onClick={() => onPick(n)}
            className="press grid size-11 place-items-center"
            aria-label={`${n} из 5`}
          >
            <Star
              size={22}
              className={cn(
                n <= value ? "fill-star text-star" : "text-border",
                "transition-[fill,color] duration-150 ease-out",
              )}
              strokeWidth={1.6}
            />
          </button>
        );
      })}
    </div>
  );
}
