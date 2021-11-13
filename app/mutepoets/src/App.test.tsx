import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders header", () => {
  render(<App />);
  const header = screen.getByText("Silence");
  expect(header).toBeInTheDocument();
});

test("renders connect button", () => {
  render(<App />);
  const connect = screen.getByText(/Connect/i);
  expect(connect).toBeInTheDocument();
});
