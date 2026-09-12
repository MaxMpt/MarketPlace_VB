import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$1 } from "./router-Bkmww-Yl.mjs";
import { i as formatRating, t as Shell } from "./shell-0aXdG5Wv.mjs";
import { t as Stars } from "./stars-Bar-f4aO.mjs";
import { t as ReviewForm } from "./review-form-D9Pox7Eb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/companies._id-CwbHkCyM.js
var import_jsx_runtime = require_jsx_runtime();
function CompanyPage() {
	const { company, photos, reviews } = Route$1.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: company.name,
		backTo: "/companies",
		children: [
			photos[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: photos[0].image_url,
				alt: "",
				className: "aspect-[4/3] w-full object-cover"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold tracking-tight",
						children: company.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: company.rating_value }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm tabular-nums text-muted",
							children: company.rating_count > 0 ? `${formatRating(company.rating_value)} · ${company.rating_count}` : "пока нет оценок"
						})]
					}),
					company.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[15px] leading-relaxed",
						children: company.description
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold",
						children: "Отзывы"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-col gap-3",
						children: reviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-xl bg-bg p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: r.author_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
									value: r.rating,
									size: 12
								})]
							}), r.review_text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-sm leading-relaxed",
								children: r.review_text
							}) : null]
						}, r.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewForm, { companyId: company.id })
					})
				]
			})
		]
	});
}
//#endregion
export { CompanyPage as component };
