import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AvatarPreviewRoute } from "../features/avatar/AvatarPreviewRoute";
import { StoneGateRoute } from "../features/intro/StoneGateRoute";
import { OfficeRoute } from "../features/office/OfficeRoute";
import { SbtiQuizRoute } from "../features/quiz/SbtiQuizRoute";

export const router = createBrowserRouter([
  { path: "/", element: <StoneGateRoute /> },
  { path: "/quiz", element: <SbtiQuizRoute /> },
  { path: "/avatar", element: <AvatarPreviewRoute /> },
  { path: "/office", element: <OfficeRoute /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
