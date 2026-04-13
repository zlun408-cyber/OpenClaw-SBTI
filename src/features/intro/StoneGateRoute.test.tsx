import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { StoneGateRoute } from "./StoneGateRoute";

test("opens the gate and reveals the quiz CTA", async () => {
  render(
    <MemoryRouter>
      <StoneGateRoute />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByRole("button", { name: /穿越之门/i }));

  expect(await screen.findByRole("button", { name: /开始试炼/i })).toBeInTheDocument();
});
