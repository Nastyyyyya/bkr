import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import DemboRubinstein from "../components/DemboRubinstein";

vi.mock("axios");

// helper
const renderComponent = () =>
  render(<DemboRubinstein childId="123" backendUrl="http://localhost:4000" />);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DemboRubinstein", () => {
  it("renders component with title", () => {
    renderComponent();

    expect(screen.getByText(/як ти почуваєшся/i)).toBeInTheDocument();
  });

  it("renders all sliders", () => {
    renderComponent();

    expect(screen.getByLabelText(/здоров/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/навчання/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/взаємини/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/настрій/i)).toBeInTheDocument();
  });

  it("updates slider value", () => {
    renderComponent();

    const slider = screen.getByLabelText(/здоров/i);

    fireEvent.change(slider, { target: { value: "80" } });

    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("submits data successfully", async () => {
    axios.post.mockResolvedValue({
      data: { success: true },
    });

    renderComponent();

    const button = screen.getByText(/зберегти результат/i);

    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(screen.getByText(/твоя відповідь записана/i)).toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    let resolvePromise;

    axios.post.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    renderComponent();

    fireEvent.click(screen.getByText(/зберегти результат/i));

    expect(screen.getByText(/збереження/i)).toBeInTheDocument();

    resolvePromise({ data: { success: true } });

    await waitFor(() => {
      expect(screen.getByText(/твоя відповідь записана/i)).toBeInTheDocument();
    });
  });

  it("shows alert on error", async () => {
    axios.post.mockRejectedValue(new Error("fail"));

    window.alert = vi.fn();

    renderComponent();

    fireEvent.click(screen.getByText(/зберегти результат/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });

  it("disables button while loading", async () => {
    axios.post.mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    renderComponent();

    const button = screen.getByText(/зберегти результат/i);

    fireEvent.click(button);

    expect(button).toBeDisabled();
  });
});
