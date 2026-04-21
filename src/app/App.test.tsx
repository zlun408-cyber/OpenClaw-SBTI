import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app shell heading", () => {
  render(<App />);
  expect(screen.getByText(/sbti digital employee/i)).toBeInTheDocument();
});
