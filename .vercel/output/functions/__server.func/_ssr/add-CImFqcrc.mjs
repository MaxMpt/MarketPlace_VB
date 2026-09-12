import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as addService, l as addCompany, s as Route$5 } from "./router-Bkmww-Yl.mjs";
import { n as cn, t as Shell } from "./shell-0aXdG5Wv.mjs";
import { t as Button } from "./button-CsbGXZhF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/add-CImFqcrc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AddPage() {
	const categories = Route$5.useLoaderData();
	const navigate = useNavigate();
	const [kind, setKind] = (0, import_react.useState)("service");
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [priceNote, setPriceNote] = (0, import_react.useState)("");
	const [categoryId, setCategoryId] = (0, import_react.useState)(categories[0]?.id ?? null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function submit() {
		if (name.trim().length < 2) {
			setError("Название слишком короткое");
			return;
		}
		setBusy(true);
		setError(null);
		try {
			if (kind === "service") {
				if (!categoryId) throw new Error("Категория");
				const { id } = await addService({ data: {
					categoryId,
					name,
					description,
					priceNote
				} });
				await navigate({
					to: "/services/$id",
					params: { id: String(id) }
				});
			} else {
				const { id } = await addCompany({ data: {
					name,
					description
				} });
				await navigate({
					to: "/companies/$id",
					params: { id: String(id) }
				});
			}
		} catch {
			setError("Не удалось сохранить.");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		title: "Новая карточка",
		backTo: "/",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex rounded-xl bg-bg p-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setKind("service"),
						className: cn("h-10 flex-1 rounded-lg text-sm font-medium", kind === "service" ? "bg-surface text-fg shadow-card" : "text-muted"),
						children: "Услуга"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setKind("company"),
						className: cn("h-10 flex-1 rounded-lg text-sm font-medium", kind === "company" ? "bg-surface text-fg shadow-card" : "text-muted"),
						children: "Компания"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-5 block text-xs font-medium text-muted",
					htmlFor: "name",
					children: "Название"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "name",
					value: name,
					onChange: (e) => setName(e.target.value),
					className: "mt-1 h-11 w-full rounded-md bg-bg px-3 text-sm shadow-card outline-none ring-primary/30 focus:ring-2",
					placeholder: kind === "service" ? "Маникюр у дома" : "Аптека у дома"
				}),
				kind === "service" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs font-medium text-muted",
						children: "Категория"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCategoryId(c.id),
							className: cn("h-9 rounded-full px-3 text-sm font-medium", categoryId === c.id ? "bg-primary text-primary-fg" : "bg-bg text-fg"),
							children: c.title
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-xs font-medium text-muted",
						htmlFor: "price",
						children: "Цена"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "price",
						value: priceNote,
						onChange: (e) => setPriceNote(e.target.value),
						className: "mt-1 h-11 w-full rounded-md bg-bg px-3 text-sm shadow-card outline-none ring-primary/30 focus:ring-2",
						placeholder: "от 1 500 ₽"
					})
				] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-4 block text-xs font-medium text-muted",
					htmlFor: "desc",
					children: "Описание"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "desc",
					value: description,
					onChange: (e) => setDescription(e.target.value),
					rows: 4,
					className: "mt-1 w-full resize-none rounded-md bg-bg px-3 py-2 text-sm shadow-card outline-none ring-primary/30 focus:ring-2"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "mt-5 w-full",
					disabled: busy,
					onClick: () => void submit(),
					children: busy ? "Сохраняем…" : "Опубликовать"
				})
			]
		})
	});
}
//#endregion
export { AddPage as component };
