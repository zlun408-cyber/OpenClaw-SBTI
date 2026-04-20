import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { StoneGateRoute } from "./StoneGateRoute";

test("opens the gate in stages before revealing the quiz CTA", async () => {
  render(
    <MemoryRouter>
      <StoneGateRoute />
    </MemoryRouter>
  );

  expect(screen.getByText(/石门状态：封印/i)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /开始试炼/i })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /穿越之门/i }));

  expect(screen.getByText(/石门状态：开启中/i)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /开始试炼/i })).not.toBeInTheDocument();

  expect(await screen.findByText(/石门状态：已开启/i)).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: /开始试炼/i })).toBeInTheDocument();
});

test("renders animated stone gate leaves and inner portal states", async () => {
  render(
    <MemoryRouter>
      <StoneGateRoute />
    </MemoryRouter>
  );

  const leftLeaf = screen.getByLabelText("stone-gate-left-leaf");
  const rightLeaf = screen.getByLabelText("stone-gate-right-leaf");
  const portalCore = screen.getByLabelText("stone-gate-core");
  const portal = screen.getByLabelText("stone-gate-portal");
  const rift = screen.getByLabelText("stone-gate-rift");

  expect(portal).toHaveAttribute("data-gate-scale", "colossal");
  expect(portal).toHaveAttribute("data-gate-style", "legendary-stone");
  expect(screen.getByLabelText("stone-gate-monolith-left")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-monolith-right")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-beast-left")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-beast-right")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-center-seam")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-torch-left")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-torch-right")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-foreground-runes")).toBeInTheDocument();
  expect(rift).toHaveAttribute("data-rift-state", "sealed");
  expect(leftLeaf).toHaveAttribute("data-motion-state", "sealed");
  expect(rightLeaf).toHaveAttribute("data-motion-state", "sealed");
  expect(portalCore).toHaveAttribute("data-energy-state", "dormant");
  expect(leftLeaf).toHaveClass("stone-gate__leaf", "stone-gate__leaf--left", "stone-gate__leaf--sealed");
  expect(rightLeaf).toHaveClass("stone-gate__leaf", "stone-gate__leaf--right", "stone-gate__leaf--sealed");
  expect(portalCore).toHaveClass("stone-gate__core", "stone-gate__core--dormant");
  expect(screen.getByLabelText("stone-gate-motion-styles")).toHaveTextContent("stone-gate-core-spin");
  expect(screen.getByLabelText("stone-gate-motion-styles")).toHaveTextContent("stone-gate-threshold-pulse");

  fireEvent.click(screen.getByRole("button", { name: /穿越之门/i }));

  expect(leftLeaf).toHaveAttribute("data-motion-state", "opening");
  expect(rightLeaf).toHaveAttribute("data-motion-state", "opening");
  expect(portalCore).toHaveAttribute("data-energy-state", "charging");
  expect(leftLeaf).toHaveClass("stone-gate__leaf--opening");
  expect(rightLeaf).toHaveClass("stone-gate__leaf--opening");
  expect(portalCore).toHaveClass("stone-gate__core--charging");
  expect(screen.getByLabelText("stone-gate-runes")).toHaveAttribute("data-rune-state", "charging");
  expect(rift).toHaveAttribute("data-rift-state", "charging");

  await screen.findByRole("button", { name: /开始试炼/i });

  expect(leftLeaf).toHaveAttribute("data-motion-state", "revealed");
  expect(rightLeaf).toHaveAttribute("data-motion-state", "revealed");
  expect(portalCore).toHaveAttribute("data-energy-state", "open");
  expect(leftLeaf).toHaveClass("stone-gate__leaf--revealed");
  expect(rightLeaf).toHaveClass("stone-gate__leaf--revealed");
  expect(portalCore).toHaveClass("stone-gate__core--open");
  expect(screen.getByLabelText("stone-gate-threshold")).toHaveAttribute("data-threshold-state", "open");
  expect(screen.getByLabelText("stone-gate-threshold")).toHaveClass("stone-gate__threshold--open");
  expect(rift).toHaveAttribute("data-rift-state", "open");
});
