import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center text-sm text-muted">
      Страница не найдена
    </div>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
  });
}