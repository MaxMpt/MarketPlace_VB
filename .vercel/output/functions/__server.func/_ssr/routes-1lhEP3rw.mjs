import { v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as Briefcase, c as Plus, g as Building2, p as ChevronRight } from "../_libs/lucide-react.mjs";
import { c as Route$6 } from "./router-Bkmww-Yl.mjs";
import { t as Shell } from "./shell-0aXdG5Wv.mjs";
import { t as ListingCard } from "./listing-card-C-2XkeGf.mjs";
import { t as CATEGORY_ICONS } from "./category-icons-C7I1xNeN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-1lhEP3rw.js
var import_jsx_runtime = require_jsx_runtime();
function StartPage() {
	const { categories, services, companies, serviceCount, companyCount } = Route$6.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "ВБ2 Каталог",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/photos/courtyard.jpg",
						alt: "",
						className: "h-52 w-full object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-fg/55" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-0 bottom-0 p-4 text-surface",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-surface/80",
								children: "Восточное Бутово 2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-2xl font-semibold tracking-tight",
								children: "Каталог двора"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-xs text-sm leading-snug text-surface/85",
								children: "Услуги жителей и компании рядом с домом. Отзывы соседей — без ленты сообщений."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 px-4 pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shortcut, {
					to: "/services",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { size: 20 }),
					title: "Услуги",
					hint: `${serviceCount} объявлений`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shortcut, {
					to: "/companies",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { size: 20 }),
					title: "Компании",
					hint: `${companyCount} рядом`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				children: categories.map((c) => {
					const Icon = CATEGORY_ICONS[c.slug];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/services",
						search: { cat: c.slug },
						className: "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-bg px-3.5 text-sm font-medium text-fg",
						children: [Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 14 }) : null, c.title]
					}, c.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
					title: "С высоким рейтингом",
					to: "/services"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-col gap-3",
					children: services.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
						to: `/services/${s.id}`,
						image: s.cover,
						title: s.name,
						subtitle: `${s.category_title}${s.author ? ` · ${s.author}` : ""}`,
						rating: s.rating_value,
						count: s.rating_count,
						priceCents: s.price_cents,
						priceNote: s.price_note
					}, s.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
					title: "Компании у дома",
					to: "/companies"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-col gap-3",
					children: companies.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
						to: `/companies/${c.id}`,
						image: c.cover,
						title: c.name,
						subtitle: c.description,
						rating: c.rating_value,
						count: c.rating_count
					}, c.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 pb-2 pt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/add",
					className: "flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 }), "Разместить объявление"]
				})
			})
		]
	});
}
function Shortcut({ to, icon, title, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "rounded-xl bg-bg p-4 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-9 place-items-center rounded-md bg-surface text-primary",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[15px] font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted",
				children: hint
			})
		]
	});
}
function SectionHead({ title, to }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-base font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to,
			className: "inline-flex items-center text-sm font-medium text-primary",
			children: ["Все", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 16 })]
		})]
	});
}
//#endregion
export { StartPage as component };
