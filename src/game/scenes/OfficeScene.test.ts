import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, test } from "vitest";

import { OfficeRoute } from "../../features/office/OfficeRoute";
import { getPersonalityDefinition } from "../../features/quiz/personalityCatalog";
import { createInitialAppState, useAppStore } from "../../state/appStore";

const ctrlResult = getPersonalityDefinition("CTRL");

beforeEach(() => {
  useAppStore.setState({
    ...createInitialAppState(),
    phase: "office",
    result: ctrlResult,
    character: {
      title: ctrlResult.title,
      customName: "Alex",
      state: "idle"
    }
  });
});

test("mounts the phaser game canvas on the office route", () => {
  render(createElement(OfficeRoute));

  expect(screen.getByTestId("game-canvas")).toBeInTheDocument();
});
