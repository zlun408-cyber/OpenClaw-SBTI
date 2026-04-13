import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("lands on the intro route by default", async () => {
  render(<App />);

  expect(await screen.findByText(/穿越之门/i)).toBeInTheDocument();
});
