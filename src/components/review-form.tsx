import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/stars";
import { addReview } from "@/lib/catalog";
import { useSession } from "@/lib/session";
import { haptic } from "@/lib/telegram";

export function ReviewForm({
  serviceId,
  companyId,
}: {
  serviceId?: number;
  companyId?: number;
}) {
  const router = useRouter();
  const { user } = useSession();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await addReview({
        data: { user, serviceId, companyId, rating, text },
      });
      setDone(true);
      setText("");
      haptic("success");
      await router.invalidate();
    } catch {
      haptic("error");
      setError("Не удалось сохранить. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <p className="rounded-xl bg-bg px-4 py-3 text-sm text-muted">Отзыв опубликован.</p>;
  }

  return (
    <form
      className="rounded-xl bg-bg p-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="text-sm font-medium">Ваша оценка</p>
      <Stars value={rating} onPick={setRating} />
      <p className="mt-2 text-xs text-muted">Подпись: {user.firstName}</p>
      <label className="mt-3 block text-xs font-medium text-muted" htmlFor="body">
        Текст
      </label>
      <textarea
        id="body"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={800}
        placeholder="Коротко, по делу"
        className="mt-1 w-full resize-none rounded-md bg-surface px-3 py-2 text-base shadow-card outline-none ring-primary/30 focus:ring-2"
      />
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <Button type="submit" className="mt-3 w-full" disabled={busy}>
        {busy ? "Сохраняем…" : "Опубликовать"}
      </Button>
    </form>
  );
}
