import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Nav from "./Nav";

test("highlights active page", () => {
  render(
    <MemoryRouter initialEntries={["/vows"]}>
      <Nav />
    </MemoryRouter>
  );
  expect(screen.getByText(/Vows/i)).toHaveClass("bg-gray-200");
});

test("does not highlight inactive page", () => {
  render(
    <MemoryRouter initialEntries={["/vows"]}>
      <Nav />
    </MemoryRouter>
  );
  expect(screen.getByText(/Claim/i)).not.toHaveClass("bg-gray-200");
  expect(screen.getByText(/Claim/i)).toHaveClass("hover:text-gray-700");
  expect(screen.getByText(/About/i)).not.toHaveClass("bg-gray-200");
  expect(screen.getByText(/About/i)).toHaveClass("hover:text-gray-700");
});
