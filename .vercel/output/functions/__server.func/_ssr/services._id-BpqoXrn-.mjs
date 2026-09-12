import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route } from "./router-Bkmww-Yl.mjs";
import { i as formatRating, r as formatPrice, t as Shell } from "./shell-0aXdG5Wv.mjs";
import { t as Stars } from "./stars-Bar-f4aO.mjs";
import { t as ReviewForm } from "./review-form-D9Pox7Eb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services._id-BpqoXrn-.js
var import_jsx_runtime = require_jsx_runtime();
function ServicePage() {
	const { service, photos, reviews } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: service.name,
		backTo: "/services",
		children: [
			photos[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: photos[0].image_url,
				alt: "",
				className: "aspect-[4/3] w-full object-cover"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-muted",
						children: [service.category_title, service.author ? ` · ${service.author}` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-xl font-semibold tracking-tight",
						children: service.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: service.rating_value }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm tabular-nums text-muted",
							children: service.rating_count > 0 ? `${formatRating(service.rating_value)} · ${service.rating_count}` : "пока нет оценок"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-base font-semibold tabular-nums",
						children: formatPrice(service.price_cents, service.price_note)
					}),
					service.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[15px] leading-relaxed text-fg",
						children: service.description
					}) : null
				]
			}),
			photos.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-2 overflow-x-auto px-4",
				children: photos.slice(1).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: p.image_url,
					alt: "",
					className: "h-24 w-32 shrink-0 rounded-lg object-cover"
				}, p.id))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold",
						children: "Отзывы"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-col gap-3",
						children: reviews.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Пока никто не написал."
						}) : reviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-xl bg-bg p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: r.author_name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
										value: r.rating,
										size: 12
									})]
								}),
								r.review_text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-sm leading-relaxed text-fg",
									children: r.review_text
								}) : null,
								r.photos[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: r.photos[0].image_url,
									alt: "",
									className: "mt-2 h-36 w-full rounded-lg object-cover"
								}) : null
							]
						}, r.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewForm, { serviceId: service.id })
					})
				]
			})
		]
	});
}
//#endregion
export { ServicePage as component };
