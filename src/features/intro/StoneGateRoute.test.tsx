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

test("renders a heavy sealed double-stone gate and opens it in legendary-door states", async () => {
  render(
    <MemoryRouter>
      <StoneGateRoute />
    </MemoryRouter>
  );

  const leftLeaf = screen.getByLabelText("stone-gate-left-leaf");
  const rightLeaf = screen.getByLabelText("stone-gate-right-leaf");
  const portal = screen.getByLabelText("stone-gate-portal");
  const centerSeam = screen.getByLabelText("stone-gate-center-seam");
  const leftTorch = screen.getByLabelText("stone-gate-torch-left");
  const rightTorch = screen.getByLabelText("stone-gate-torch-right");

  expect(portal).toHaveAttribute("data-gate-scale", "colossal");
  expect(portal).toHaveAttribute("data-gate-style", "legendary-stone");
  expect(screen.getByLabelText("stone-gate-doorframe")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-doorframe")).toHaveAttribute("data-stone-finish", "weathered");
  expect(screen.getByLabelText("stone-gate-monolith-left")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-monolith-right")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-beast-left")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-beast-right")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-relief-band")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-relief-band")).toHaveAttribute("data-relief-weight", "heavy");
  expect(screen.getByLabelText("stone-gate-center-seam")).toBeInTheDocument();
  expect(screen.getByLabelText("stone-gate-inner-glow")).toHaveAttribute("data-glow-strength", "faint");
  expect(leftTorch).toHaveAttribute("data-torch-placement", "edge");
  expect(rightTorch).toHaveAttribute("data-torch-placement", "edge");
  expect(screen.queryByLabelText("stone-gate-core")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("stone-gate-rift")).not.toBeInTheDocument();
  expect(leftLeaf).toHaveAttribute("data-motion-state", "sealed");
  expect(rightLeaf).toHaveAttribute("data-motion-state", "sealed");
  expect(leftLeaf).toHaveAttribute("data-door-shape", "flat-slab");
  expect(rightLeaf).toHaveAttribute("data-door-shape", "flat-slab");
  expect(centerSeam).toHaveAttribute("data-seam-state", "sealed");
  expect(leftTorch).toHaveAttribute("data-fire-state", "ember");
  expect(rightTorch).toHaveAttribute("data-fire-state", "ember");
  expect(leftLeaf).toHaveClass(
    "stone-gate__door-leaf",
    "stone-gate__door-leaf--left",
    "stone-gate__door-leaf--sealed"
  );
  expect(rightLeaf).toHaveClass(
    "stone-gate__door-leaf",
    "stone-gate__door-leaf--right",
    "stone-gate__door-leaf--sealed"
  );
  expect(screen.getByLabelText("stone-gate-motion-styles")).toHaveTextContent("stone-gate-door-open-left");
  expect(screen.getByLabelText("stone-gate-motion-styles")).toHaveTextContent("stone-gate-fire-flicker");

  fireEvent.click(screen.getByRole("button", { name: /穿越之门/i }));

  expect(leftLeaf).toHaveAttribute("data-motion-state", "opening");
  expect(rightLeaf).toHaveAttribute("data-motion-state", "opening");
  expect(centerSeam).toHaveAttribute("data-seam-state", "glowing");
  expect(leftTorch).toHaveAttribute("data-fire-state", "blazing");
  expect(rightTorch).toHaveAttribute("data-fire-state", "blazing");
  expect(leftLeaf).toHaveClass("stone-gate__door-leaf--opening");
  expect(rightLeaf).toHaveClass("stone-gate__door-leaf--opening");

  await screen.findByRole("button", { name: /开始试炼/i });

  expect(leftLeaf).toHaveAttribute("data-motion-state", "revealed");
  expect(rightLeaf).toHaveAttribute("data-motion-state", "revealed");
  expect(centerSeam).toHaveAttribute("data-seam-state", "open");
  expect(leftTorch).toHaveAttribute("data-fire-state", "revealed");
  expect(rightTorch).toHaveAttribute("data-fire-state", "revealed");
  expect(leftLeaf).toHaveClass("stone-gate__door-leaf--revealed");
  expect(rightLeaf).toHaveClass("stone-gate__door-leaf--revealed");
  expect(screen.getByLabelText("stone-gate-threshold")).toHaveAttribute("data-threshold-state", "open");
  expect(screen.getByLabelText("stone-gate-threshold")).toHaveClass("stone-gate__threshold--open");
});
