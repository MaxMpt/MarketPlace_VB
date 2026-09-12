import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Route$2 } from "./router-Bkmww-Yl.mjs";
import { n as cn, t as Shell } from "./shell-0aXdG5Wv.mjs";
import { t as ListingCard } from "./listing-card-C-2XkeGf.mjs";
import { t as CATEGORY_ICONS } from "./category-icons-C7I1xNeN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-DPT_Y64D.js
var import_jsx_runtime = require_jsx_runtime();
function ServicesPage() {
	const { categories, services } = Route$2.useLoaderData();
	const { cat } = Route$2.useSearch();
	const navigate = Route$2.useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Услуги жителей",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 pt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Объявления соседей по двору"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: !cat,
					label: "Все",
					onClick: () => navigate({ search: { cat: void 0 } })
				}), categories.map((c) => {
					const Icon = CATEGORY_ICONS[c.slug];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: cat === c.slug,
						label: c.title,
						icon: Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 14 }) : null,
						onClick: () => navigate({ search: { cat: cat === c.slug ? void 0 : c.slug } })
					}, c.id);
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-col gap-3 px-4",
			children: services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-bg px-4 py-8 text-center text-sm text-muted",
				children: "В этой категории пока пусто."
			}) : services.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
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
	});
}
function Chip({ active, label, icon, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors duration-150", active ? "bg-primary text-primary-fg" : "bg-bg text-fg"),
		children: [icon, label]
	});
}
//#endregion
export { ServicesPage as component };
