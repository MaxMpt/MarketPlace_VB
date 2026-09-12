import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number | null, note: string | null) {
  if (note) return note;
  if (cents == null) return "договорная";
  const rub = Math.round(cents / 100);
  return `от ${rub.toLocaleString("ru-RU")} ₽`;
}

export function formatRating(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n) || n <= 0) return "нет оценок";
  return n.toFixed(1).replace(".", ",");
}
