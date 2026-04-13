import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { appRoutes } from "./router";

test("lands on the intro route by default", async () => {
  render(<App />);

  expect(await screen.findByRole("button", { name: /穿越之门/i })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: /sbti quiz/i })).not.toBeInTheDocument();
});

test.each([
  ["/quiz", /sbti quiz/i],
  ["/avatar", /avatar preview/i],
  ["/office", /^office$/i],
] as const)("renders route shell for %s", async (path, heading) => {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

  render(<RouterProvider router={router} />);

  expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument();
});
