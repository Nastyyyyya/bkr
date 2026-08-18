import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AffectiveGoNoGoKeyboard from "../components/AffectiveGoNoGo";
import "@testing-library/jest-dom";

describe("AffectiveGoNoGoKeyboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    vi.spyOn(Math, "random").mockReturnValue(0.1);

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <AffectiveGoNoGoKeyboard
        childId="123"
        backendUrl="http://localhost:4000"
      />,
    );

  it("renders start screen", () => {
    renderComponent();
    expect(screen.getByText(/почати гру/i)).toBeInTheDocument();
  });

  it("starts game and shows timer", () => {
    renderComponent();
    fireEvent.click(screen.getByText(/почати гру/i));
    expect(screen.getByText(/залишилось: 60/i)).toBeInTheDocument();
  });

  it("handles space click (GO hit)", async () => {
    renderComponent();
    fireEvent.click(screen.getByText(/почати гру/i));

    // Натискаємо пробіл
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    });

    expect(screen.getByText(/тисни space/i)).toBeInTheDocument();
  });

  it("restarts game button works", async () => {
    renderComponent();
    fireEvent.click(screen.getByText(/почати гру/i));

    for (let i = 0; i < 61; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(screen.getByText(/правильні влучання/i)).toBeInTheDocument();
  });
});
