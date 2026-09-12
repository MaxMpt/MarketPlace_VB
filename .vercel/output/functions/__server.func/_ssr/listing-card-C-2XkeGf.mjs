import { v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as formatRating, r as formatPrice } from "./shell-0aXdG5Wv.mjs";
import { t as Stars } from "./stars-Bar-f4aO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listing-card-C-2XkeGf.js
var import_jsx_runtime = require_jsx_runtime();
function ListingCard({ to, image, title, subtitle, rating, count, priceCents, priceNote }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "flex gap-3 rounded-xl bg-surface p-2 shadow-card transition-transform duration-150 active:scale-[0.99]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "size-[88px] shrink-0 overflow-hidden rounded-lg bg-bg",
			children: image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: image,
				alt: "",
				className: "size-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-full bg-bg" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1 py-0.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-[15px] font-semibold leading-snug",
					children: title
				}),
				subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 truncate text-xs text-muted",
					children: subtitle
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: rating }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs tabular-nums text-muted",
						children: count > 0 ? `${formatRating(rating)} · ${count}` : "пока нет оценок"
					})]
				}),
				priceCents !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm font-medium tabular-nums text-fg",
					children: formatPrice(priceCents ?? null, priceNote ?? null)
				}) : null
			]
		})]
	});
}
//#endregion
export { ListingCard as t };
