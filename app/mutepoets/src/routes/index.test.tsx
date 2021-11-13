import { render, screen } from "@testing-library/react";
import Routes from "./index";

test("home page", () => {
  render(<Routes />);
  expect(screen.getByText("Silence")).toBeInTheDocument();
});
