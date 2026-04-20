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

  expect(leftLeaf).toHaveAttribute("data-motion-state", "sealed");
  expect(rightLeaf).toHaveAttribute("data-motion-state", "sealed");
  expect(portalCore).toHaveAttribute("data-energy-state", "dormant");

  fireEvent.click(screen.getByRole("button", { name: /穿越之门/i }));

  expect(leftLeaf).toHaveAttribute("data-motion-state", "opening");
  expect(rightLeaf).toHaveAttribute("data-motion-state", "opening");
  expect(portalCore).toHaveAttribute("data-energy-state", "charging");
  expect(screen.getByLabelText("stone-gate-runes")).toHaveAttribute("data-rune-state", "charging");

  await screen.findByRole("button", { name: /开始试炼/i });

  expect(leftLeaf).toHaveAttribute("data-motion-state", "revealed");
  expect(rightLeaf).toHaveAttribute("data-motion-state", "revealed");
  expect(portalCore).toHaveAttribute("data-energy-state", "open");
  expect(screen.getByLabelText("stone-gate-threshold")).toHaveAttribute("data-threshold-state", "open");
});
