import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Plus, u as MapPin } from "../_libs/lucide-react.mjs";
import { a as Route$3 } from "./router-Bkmww-Yl.mjs";
import { t as Shell } from "./shell-0aXdG5Wv.mjs";
import { t as Stars } from "./stars-Bar-f4aO.mjs";
import { t as ListingCard } from "./listing-card-C-2XkeGf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-oLhyzQMT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { listings, reviews } = Route$3.useLoaderData();
	const [name, setName] = (0, import_react.useState)("Житель");
	(0, import_react.useEffect)(() => {
		const saved = localStorage.getItem("vb2-name");
		if (saved) setName(saved);
	}, []);
	function saveName(value) {
		setName(value);
		localStorage.setItem("vb2-name", value);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Профиль",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/photos/resident.jpg",
							alt: "",
							className: "size-20 rounded-xl object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-medium text-muted",
									htmlFor: "display-name",
									children: "Имя в каталоге"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "display-name",
									value: name,
									onChange: (e) => saveName(e.target.value),
									className: "mt-1 h-11 w-full rounded-md bg-bg px-3 text-base font-semibold shadow-card outline-none ring-primary/30 focus:ring-2"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1.5 inline-flex items-center gap-1 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 12 }), "Восточное Бутово 2"]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Мои объявления",
							value: listings.length
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Мои отзывы",
							value: reviews.length
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/add",
						className: "mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 }), "Новая карточка"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-semibold",
					children: "Мои услуги"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-col gap-3",
					children: listings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl bg-bg px-4 py-6 text-sm text-muted",
						children: "Пока нет объявлений. Нажмите «Новая карточка», если оказываете услугу соседям."
					}) : listings.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
						to: `/services/${s.id}`,
						image: s.cover,
						title: s.name,
						subtitle: s.category_title,
						rating: s.rating_value,
						count: s.rating_count,
						priceCents: s.price_cents,
						priceNote: s.price_note
					}, s.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 px-4 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-semibold",
					children: "Мои отзывы"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-col gap-3",
					children: reviews.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl bg-bg px-4 py-6 text-sm text-muted",
						children: "Оцените услугу или компанию — отзыв появится здесь."
					}) : reviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: r.kind === "service" ? "/services/$id" : "/companies/$id",
						params: { id: String(r.target_id) },
						className: "block rounded-xl bg-bg p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: r.target_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {
								value: r.rating,
								size: 12
							})]
						}), r.review_text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm leading-relaxed text-fg",
							children: r.review_text
						}) : null]
					}, r.id))
				})]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-bg px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xl font-semibold tabular-nums tracking-tight",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 text-xs text-muted",
			children: label
		})]
	});
}
//#endregion
export { ProfilePage as component };
