import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Star } from "../_libs/lucide-react.mjs";
import { n as cn } from "./shell-0aXdG5Wv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stars-Bar-f4aO.js
var import_jsx_runtime = require_jsx_runtime();
function Stars({ value, size = 14, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "inline-flex items-center gap-0.5",
		"aria-label": `Оценка ${value} из 5`,
		children: [
			1,
			2,
			3,
			4,
			5
		].map((n) => {
			const icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
				size,
				className: cn(n <= Math.round(value) ? "fill-star text-star" : "text-border"),
				strokeWidth: 1.6
			}, n);
			if (!onPick) return icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onPick(n),
				className: "grid size-11 place-items-center",
				"aria-label": `${n} из 5`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
					size: 22,
					className: cn(n <= value ? "fill-star text-star" : "text-border"),
					strokeWidth: 1.6
				})
			}, n);
		})
	});
}
//#endregion
export { Stars as t };
