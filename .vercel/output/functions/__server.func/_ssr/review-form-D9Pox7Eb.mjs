import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useRouter, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as addReview } from "./router-Bkmww-Yl.mjs";
import { t as Button } from "./button-CsbGXZhF.mjs";
import { t as Stars } from "./stars-Bar-f4aO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/review-form-D9Pox7Eb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReviewForm({ serviceId, companyId }) {
	const router = useRouter();
	const [rating, setRating] = (0, import_react.useState)(5);
	const [text, setText] = (0, import_react.useState)("");
	const [author, setAuthor] = (0, import_react.useState)("Житель");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [done, setDone] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function submit() {
		setBusy(true);
		setError(null);
		try {
			await addReview({ data: {
				serviceId,
				companyId,
				rating,
				text,
				author
			} });
			setDone(true);
			setText("");
			await router.invalidate();
		} catch {
			setError("Не удалось сохранить. Попробуйте ещё раз.");
		} finally {
			setBusy(false);
		}
	}
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-bg px-4 py-3 text-sm text-muted",
		children: "Отзыв опубликован."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "rounded-xl bg-bg p-4",
		onSubmit: (e) => {
			e.preventDefault();
			submit();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "Ваша оценка"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
				value: rating,
				onPick: setRating
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-3 block text-xs font-medium text-muted",
				htmlFor: "author",
				children: "Как подписать"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "author",
				value: author,
				onChange: (e) => setAuthor(e.target.value),
				maxLength: 40,
				className: "mt-1 h-11 w-full rounded-md bg-surface px-3 text-sm shadow-card outline-none ring-primary/30 focus:ring-2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-3 block text-xs font-medium text-muted",
				htmlFor: "body",
				children: "Текст"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "body",
				value: text,
				onChange: (e) => setText(e.target.value),
				rows: 3,
				maxLength: 800,
				placeholder: "Коротко, по делу",
				className: "mt-1 w-full resize-none rounded-md bg-surface px-3 py-2 text-sm shadow-card outline-none ring-primary/30 focus:ring-2"
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "mt-3 w-full",
				disabled: busy,
				children: busy ? "Сохраняем…" : "Опубликовать"
			})
		]
	});
}
//#endregion
export { ReviewForm as t };
