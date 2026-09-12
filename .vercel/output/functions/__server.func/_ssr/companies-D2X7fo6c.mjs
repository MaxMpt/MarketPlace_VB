import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Route$4 } from "./router-Bkmww-Yl.mjs";
import { t as Shell } from "./shell-0aXdG5Wv.mjs";
import { t as ListingCard } from "./listing-card-C-2XkeGf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/companies-D2X7fo6c.js
var import_jsx_runtime = require_jsx_runtime();
function CompaniesPage() {
	const companies = Route$4.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		title: "Компании района",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 pt-4 text-sm text-muted",
			children: "Магазины, аптеки, кружки рядом с домом"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-col gap-3 px-4",
			children: companies.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
				to: `/companies/${c.id}`,
				image: c.cover,
				title: c.name,
				subtitle: c.description,
				rating: c.rating_value,
				count: c.rating_count
			}, c.id))
		})]
	});
}
//#endregion
export { CompaniesPage as component };
