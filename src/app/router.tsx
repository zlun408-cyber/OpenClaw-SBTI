import { useRef } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import { AvatarPreviewRoute } from "../features/avatar/AvatarPreviewRoute";
import { StoneGateRoute } from "../features/intro/StoneGateRoute";
import { OfficeRoute } from "../features/office/OfficeRoute";
import { SbtiQuizRoute } from "../features/quiz/SbtiQuizRoute";

export const appRoutes: RouteObject[] = [
  { path: "/", element: <StoneGateRoute /> },
  { path: "/quiz", element: <SbtiQuizRoute /> },
  { path: "/avatar", element: <AvatarPreviewRoute /> },
  { path: "/office", element: <OfficeRoute /> },
];

export function createAppRouter() {
  return createBrowserRouter(appRoutes);
}

export function AppRouter() {
  const routerRef = useRef<ReturnType<typeof createAppRouter> | null>(null);

  if (routerRef.current === null) {
    routerRef.current = createAppRouter();
  }

  return <RouterProvider router={routerRef.current} />;
}
