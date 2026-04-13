import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, test } from "vitest";

import { OfficeRoute } from "../../features/office/OfficeRoute";
import { createInitialAppState, useAppStore } from "../../state/appStore";

beforeEach(() => {
  useAppStore.setState({
    ...createInitialAppState(),
    phase: "office",
    result: {
      resultType: "CTRL",
      title: "Architect"
    },
    character: {
      title: "Architect",
      customName: "Alex",
      state: "idle"
    }
  });
});

test("mounts the phaser game canvas on the office route", () => {
  render(createElement(OfficeRoute));

  expect(screen.getByTestId("game-canvas")).toBeInTheDocument();
});
