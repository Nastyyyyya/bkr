import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import axios from "axios";
import LuscherTest from "../pages/LuscherTest";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

vi.mock("axios");

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const mockContext = {
  backendUrl: "http://localhost:4000",
};

const renderComp = (childId = "123") =>
  render(
    <AppContext.Provider value={mockContext}>
      <LuscherTest childId={childId} />
    </AppContext.Provider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

it("fills step 1 selection (branch: step===1)", () => {
  renderComp();

  const buttons = screen.getAllByRole("button");

  for (let i = 0; i < 8; i++) {
    fireEvent.click(buttons[i]);
  }

  expect(screen.getByText(/крок 1/i)).toBeInTheDocument();
});

it("switches to step 2 (branch: step===1 && length===8)", () => {
  renderComp();

  const buttons = screen.getAllByRole("button");

  for (let i = 0; i < 8; i++) {
    fireEvent.click(buttons[i]);
  }

  fireEvent.click(screen.getByText(/далі/i));

  expect(screen.getByText(/крок 2/i)).toBeInTheDocument();
});

it("button is disabled when selection < 8 (ternary branch)", () => {
  renderComp();

  const btn = screen.getByText(/далі/i);

  expect(btn).toBeDisabled();
});

it("sends API and shows result (step2 success branch)", async () => {
  axios.post.mockResolvedValueOnce({
    data: {
      success: true,
      interpretation: ["Test result 1", "Test result 2"],
    },
  });

  renderComp();

  const buttons = screen.getAllByRole("button");

  // step 1 fill
  for (let i = 0; i < 8; i++) {
    fireEvent.click(buttons[i]);
  }

  fireEvent.click(screen.getByText(/далі/i));

  // step 2 fill
  const step2Buttons = screen.getAllByRole("button");
  for (let i = 0; i < 8; i++) {
    fireEvent.click(step2Buttons[i]);
  }

  fireEvent.click(screen.getByText(/результат/i));

  await waitFor(() => {
    expect(screen.getByText(/ось результати/i)).toBeInTheDocument();
  });
});

it("handles API error branch", async () => {
  axios.post.mockRejectedValueOnce(new Error("fail"));

  renderComp();

  const buttons = screen.getAllByRole("button");

  for (let i = 0; i < 8; i++) {
    fireEvent.click(buttons[i]);
  }

  fireEvent.click(screen.getByText(/далі/i));

  const step2Buttons = screen.getAllByRole("button");
  for (let i = 0; i < 8; i++) {
    fireEvent.click(step2Buttons[i]);
  }

  fireEvent.click(screen.getByText(/результат/i));

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Сервер не відповідає");
  });
});
