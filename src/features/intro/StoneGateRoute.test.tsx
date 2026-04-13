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
