import "@testing-library/jest-dom";
import { beforeEach, test, expect } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AvatarPreviewRoute } from "./AvatarPreviewRoute";
import { createInitialAppState, useAppStore } from "../../state/appStore";
import { appRoutes } from "../../app/router";

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
});

test("lets the user rename the generated character", async () => {
  useAppStore.getState().completeQuiz({ resultType: "CTRL", title: "控制者" });
  const router = createMemoryRouter([{ path: "/avatar", element: <AvatarPreviewRoute /> }], {
    initialEntries: ["/avatar"]
  });

  render(<RouterProvider router={router} />);

  fireEvent.change(screen.getByLabelText(/角色姓名/i), { target: { value: "阿张" } });

  expect(screen.getByDisplayValue("阿张")).toBeInTheDocument();
});

test("completing quiz advances into avatar flow with generated result", async () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  fireEvent.click(screen.getByRole("button", { name: "先定规则和边界，确保方向可控" }));
  fireEvent.click(screen.getByRole("button", { name: "设定决策原则，快速收敛" }));
  fireEvent.click(screen.getByRole("button", { name: "优先排定优先级，避免失控" }));

  expect(await screen.findByRole("heading", { name: /avatar preview/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "控制者" })).toBeInTheDocument();
  expect(useAppStore.getState().result?.title).toBe("控制者");
});

test("entering office persists the chosen name", async () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  fireEvent.click(screen.getByRole("button", { name: "先定规则和边界，确保方向可控" }));
  fireEvent.click(screen.getByRole("button", { name: "设定决策原则，快速收敛" }));
  fireEvent.click(screen.getByRole("button", { name: "优先排定优先级，避免失控" }));
  expect(await screen.findByRole("heading", { name: /avatar preview/i })).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/角色姓名/i), { target: { value: "阿张" } });
  fireEvent.click(screen.getByRole("button", { name: /进入数字办公室/i }));

  await waitFor(() => {
    expect(useAppStore.getState().character.customName).toBe("阿张");
    expect(useAppStore.getState().phase).toBe("office");
  });
  expect(await screen.findByRole("heading", { name: /^office$/i })).toBeInTheDocument();
});

test("blocks cold-load deep-link to avatar", async () => {
  const avatarRouter = createMemoryRouter(appRoutes, { initialEntries: ["/avatar"] });
  render(<RouterProvider router={avatarRouter} />);

  expect(await screen.findByRole("heading", { name: /sbti quiz/i })).toBeInTheDocument();
});

test("blocks cold-load deep-link to office", async () => {
  const officeRouter = createMemoryRouter(appRoutes, { initialEntries: ["/office"] });
  render(<RouterProvider router={officeRouter} />);

  expect(await screen.findByRole("heading", { name: /sbti quiz/i })).toBeInTheDocument();
});

test("restarting quiz clears stale preview state and blocks avatar deep-link", async () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  fireEvent.click(screen.getByRole("button", { name: "先定规则和边界，确保方向可控" }));
  fireEvent.click(screen.getByRole("button", { name: "设定决策原则，快速收敛" }));
  fireEvent.click(screen.getByRole("button", { name: "优先排定优先级，避免失控" }));
  expect(await screen.findByRole("heading", { name: /avatar preview/i })).toBeInTheDocument();

  await act(async () => {
    await router.navigate("/quiz");
  });
  expect(await screen.findByRole("heading", { name: /sbti quiz/i })).toBeInTheDocument();

  await act(async () => {
    await router.navigate("/avatar");
  });
  expect(await screen.findByRole("heading", { name: /sbti quiz/i })).toBeInTheDocument();
});
