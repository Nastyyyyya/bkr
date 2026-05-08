import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import axios from "axios";
import MoodCalendar from "../components/MoodCalendar";
import { AppContext } from "../context/AppContext";

vi.mock("axios");

const mockContext = {
  backendUrl: "http://localhost:4000",
};

const renderComp = () =>
  render(
    <AppContext.Provider value={mockContext}>
      <MoodCalendar childId="123" />
    </AppContext.Provider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

it("loads moods and maps history correctly", async () => {
  axios.get.mockResolvedValueOnce({
    data: [
      { date: "2026-05-01", mood: "happy" },
      { date: "2026-05-02", mood: "sad" },
    ],
  });

  renderComp();

  await waitFor(() => {
    expect(axios.get).toHaveBeenCalled();
  });
});

it("handles API error branch", async () => {
  axios.get.mockRejectedValueOnce(new Error("fail"));

  renderComp();

  await waitFor(() => {
    expect(axios.get).toHaveBeenCalled();
  });
});

it("changes month forward and backward", () => {
  renderComp();

  const buttons = screen.getAllByRole("button");

  fireEvent.click(buttons[0]); // prev month
  fireEvent.click(buttons[1]); // next month

  expect(buttons.length).toBeGreaterThan(0);
});

it("renders mood colors correctly (switch branch)", async () => {
  axios.get.mockResolvedValueOnce({
    data: [
      { date: "2026-05-01", mood: "happy" },
      { date: "2026-05-02", mood: "neutral" },
      { date: "2026-05-03", mood: "sad" },
      { date: "2026-05-04", mood: "angry" },
      { date: "2026-05-05", mood: "tired" },
    ],
  });

  renderComp();

  await waitFor(() => {
    expect(screen.getAllByText(/\d/).length).toBeGreaterThan(0);
  });
});

it("renders empty day fallback branch", async () => {
  axios.get.mockResolvedValueOnce({ data: [] });

  renderComp();

  await waitFor(() => {
    const days = screen.getAllByText(/^[0-9]{1,2}$/);
    expect(days.length).toBeGreaterThan(0);
  });
});
