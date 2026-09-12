import { d as useRouterState, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as Briefcase, d as House, g as Building2, m as ChevronLeft, r as User } from "../_libs/lucide-react.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-0aXdG5Wv.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatPrice(cents, note) {
	if (note) return note;
	if (cents == null) return "договорная";
	return `от ${Math.round(cents / 100).toLocaleString("ru-RU")} ₽`;
}
function formatRating(value) {
	const n = typeof value === "string" ? parseFloat(value) : value;
	if (!Number.isFinite(n) || n <= 0) return "нет оценок";
	return n.toFixed(1).replace(".", ",");
}
function Shell({ title, backTo, children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const tab = pathname.startsWith("/companies") ? "companies" : pathname.startsWith("/services") ? "services" : pathname.startsWith("/profile") ? "profile" : pathname.startsWith("/add") ? "home" : "home";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh max-w-md flex-col bg-surface shadow-[0_0_0_1px_var(--color-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex h-12 items-center gap-1 border-b border-border bg-surface/95 px-1 pt-[env(safe-area-inset-top)] backdrop-blur-sm",
				children: [
					backTo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: backTo,
						className: "grid size-11 place-items-center text-primary",
						"aria-label": "Назад",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 22 })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-11" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "min-w-0 flex-1 truncate text-center text-[17px] font-semibold tracking-tight",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-11" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 overflow-x-hidden pb-24",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
						to: "/",
						active: tab === "home",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { size: 20 }),
						label: "Главная"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
						to: "/services",
						active: tab === "services",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { size: 20 }),
						label: "Услуги"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
						to: "/companies",
						active: tab === "companies",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { size: 20 }),
						label: "Компании"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
						to: "/profile",
						active: tab === "profile",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 20 }),
						label: "Профиль"
					})
				]
			})
		]
	});
}
function TabLink({ to, active, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium", active ? "text-primary" : "text-subtle"),
		children: [icon, label]
	});
}
//#endregion
export { formatRating as i, cn as n, formatPrice as r, Shell as t };
