import "@testing-library/jest-dom";
import { beforeEach, test, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AvatarPreviewRoute } from "./AvatarPreviewRoute";
import { createInitialAppState, useAppStore } from "../../state/appStore";

beforeEach(() => {
  useAppStore.setState(createInitialAppState());
  useAppStore.setState((state) => ({
    ...state,
    phase: "avatarPreview",
    character: { ...state.character, title: "控制者", customName: "" }
  }));
});

test("lets the user rename the generated character", async () => {
  render(
    <MemoryRouter>
      <AvatarPreviewRoute />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/角色姓名/i), { target: { value: "阿张" } });

  expect(screen.getByDisplayValue("阿张")).toBeInTheDocument();
});
