import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach } from "vitest";
import App from "./App";
import { appRoutes } from "./router";
import { createInitialAppState, useAppStore } from "../state/appStore";

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
});

test("lands on the intro route by default", async () => {
  render(<App />);

  expect(await screen.findByRole("button", { name: /穿越之门/i })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: /sbti quiz/i })).not.toBeInTheDocument();
});

test.each([
  ["/quiz", /sbti quiz/i],
  ["/avatar", /sbti quiz/i],
  ["/office", /sbti quiz/i],
] as const)("renders guarded route shell for %s", async (path, heading) => {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

  render(<RouterProvider router={router} />);

  expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument();
});
