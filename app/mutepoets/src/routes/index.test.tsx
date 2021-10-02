import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Routes from "./index";

test("home page", () => {
  render(<Routes />);
  expect(screen.getByText("Mute Poets")).toBeInTheDocument();
});
