import "@testing-library/jest-dom";
import { beforeEach, test, expect } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AvatarPreviewRoute } from "./AvatarPreviewRoute";
import { getPersonalityDefinition } from "../quiz/personalityCatalog";
import { questions } from "../quiz/questions";
import { createInitialAppState, useAppStore } from "../../state/appStore";
import { appRoutes } from "../../app/router";

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
});

const ctrlResult = getPersonalityDefinition("CTRL");
const drunkResult = getPersonalityDefinition("DRUNK");

const answerEveryQuestionForAxis = (axis: "control" | "execution" | "harmony") => {
  for (const question of questions) {
    const option = question.options.find((item) => item.axis === axis);
    if (!option) {
      throw new Error(`Missing ${axis} answer for ${question.id}`);
    }

    fireEvent.click(screen.getByRole("button", { name: option.label }));
  }
};

const seedAvatarPreview = (result = ctrlResult) => {
  const store = useAppStore.getState();
  store.completeQuiz(result);
  store.enterAvatarPreview();
};

const seedOffice = () => {
  const store = useAppStore.getState();
  store.completeQuiz(ctrlResult);
  store.enterAvatarPreview();
  store.enterOffice("阿控");
};

test("lets the user rename the generated character", async () => {
  seedAvatarPreview();
  const router = createMemoryRouter([{ path: "/avatar", element: <AvatarPreviewRoute /> }], {
    initialEntries: ["/avatar"]
  });

  render(<RouterProvider router={router} />);

  fireEvent.change(screen.getByLabelText(/角色姓名/i), { target: { value: "阿张" } });

  expect(screen.getByDisplayValue("阿张")).toBeInTheDocument();
});

test("shows the richer sbti result narrative and portrait preview", async () => {
  seedAvatarPreview();
  const router = createMemoryRouter([{ path: "/avatar", element: <AvatarPreviewRoute /> }], {
    initialEntries: ["/avatar"]
  });

  render(<RouterProvider router={router} />);

  expect(screen.getByRole("heading", { name: "拿捏者" })).toBeInTheDocument();
  expect(screen.getByText("控场与边界感很强的主导型人格")).toBeInTheDocument();
  expect(screen.getByText("怎么样，被我拿捏了吧？")).toBeInTheDocument();
  expect(screen.getByText("习惯先建立秩序、标准与控制面，再推进整体局势。")).toBeInTheDocument();
  expect(screen.getByText("秩序主导")).toBeInTheDocument();
  expect(screen.getByText("掌控 / 边界 / 决策")).toBeInTheDocument();
  expect(screen.getByLabelText("人格立绘预览")).toBeInTheDocument();
});

test("renders the shared registry portrait for the generated persona", async () => {
  seedAvatarPreview(drunkResult);
  const router = createMemoryRouter([{ path: "/avatar", element: <AvatarPreviewRoute /> }], {
    initialEntries: ["/avatar"]
  });

  render(<RouterProvider router={router} />);

  expect(screen.getByRole("heading", { name: "酒鬼" })).toBeInTheDocument();
  expect(screen.getByAltText("酒鬼 人格立绘")).toHaveAttribute(
    "src",
    "/assets/characters/drunk/transparent.png"
  );
});

test("completing quiz advances into avatar flow with generated full result payload", async () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  answerEveryQuestionForAxis("control");

  expect(await screen.findByRole("heading", { name: /avatar preview/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "拿捏者" })).toBeInTheDocument();
  expect(screen.getByText("控场与边界感很强的主导型人格")).toBeInTheDocument();
  expect(useAppStore.getState().result).toMatchObject({
    code: "CTRL",
    title: "拿捏者",
    slogan: "怎么样，被我拿捏了吧？"
  });
});

test("entering office persists the chosen name", async () => {
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/quiz"] });
  render(<RouterProvider router={router} />);

  answerEveryQuestionForAxis("control");
  expect(await screen.findByRole("heading", { name: /avatar preview/i })).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/角色姓名/i), { target: { value: "阿张" } });
  fireEvent.click(screen.getByRole("button", { name: /进入数字办公室/i }));

  await waitFor(() => {
    expect(useAppStore.getState().character.customName).toBe("阿张");
    expect(useAppStore.getState().phase).toBe("office");
  });
  expect(await screen.findByTestId("game-canvas")).toBeInTheDocument();
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

  answerEveryQuestionForAxis("control");
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

test("blocks manual office deep-link from avatar preview before CTA", async () => {
  seedAvatarPreview();
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/avatar"] });
  render(<RouterProvider router={router} />);

  expect(await screen.findByRole("heading", { name: /avatar preview/i })).toBeInTheDocument();
  expect(useAppStore.getState().phase).toBe("avatarPreview");

  await act(async () => {
    await router.navigate("/office");
  });

  expect(await screen.findByRole("heading", { name: /sbti quiz/i })).toBeInTheDocument();
});

test("blocks avatar revisit after entering office", async () => {
  seedOffice();
  const router = createMemoryRouter(appRoutes, { initialEntries: ["/office"] });
  render(<RouterProvider router={router} />);

  expect(await screen.findByTestId("game-canvas")).toBeInTheDocument();

  await act(async () => {
    await router.navigate("/avatar");
  });

  expect(await screen.findByTestId("game-canvas")).toBeInTheDocument();
});
