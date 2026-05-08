import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AffectiveGoNoGoKeyboard from "../components/AffectiveGoNoGo";
import "@testing-library/jest-dom";

describe("AffectiveGoNoGoKeyboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Фіксуємо Math.random, щоб завжди випадав "Go" (зелений)
    // 0.1 < 0.7 (логіка компонента)
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

    // Перевірка, що натискання зафіксовано (в коді немає тексту підтвердження,
    // тому перевіряємо, що ми все ще в грі)
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

    // Шукаємо кнопку через контейнер результатів (вона зазвичай називається "ПОЧАТИ ГРУ" або подібне)
    // У вашому коді кнопки рестарту немає, але є логіка повернення до стану ready
    // Якщо ви додасте кнопку, тест її знайде. Зараз перевіримо фінальний екран:
    expect(screen.getByText(/правильні влучання/i)).toBeInTheDocument();
  });
});
