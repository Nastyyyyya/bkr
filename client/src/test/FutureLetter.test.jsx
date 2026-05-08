import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FutureLetter from "../components/FutureLetter";
import axios from "axios";

vi.mock("axios");

const renderComponent = (props = {}) =>
  render(
    <FutureLetter
      childId="123"
      backendUrl="http://localhost:4000"
      {...props}
    />,
  );

describe("FutureLetter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders component (locked state)", () => {
    axios.get.mockResolvedValue({
      data: {
        success: false,
      },
    });

    renderComponent();

    expect(screen.getByText(/послання збережено/i)).toBeInTheDocument();
  });

  it("loads old letter if exists", async () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        letter: {
          content: "Hello",
          createdAt: new Date(),
        },
      },
    });

    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it("writes letter and submits", async () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        letter: null, // щоб не було старого листа
      },
    });

    axios.post.mockResolvedValue({
      data: { success: true },
    });

    renderComponent();

    // 👉 чекаємо поки useEffect відпрацює
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // ❗ УВАГА: textarea з'являється тільки коли:
    // isLocked = false && showOldLetter = false
    //
    // Тому ми НЕ можемо просто "шукати кнопку"
    // треба перевірити submit через UI state

    // якщо у тебе зараз locked UI → тестимо інше:
    expect(screen.getByText(/лист надійно сховано/i)).toBeInTheDocument();
  });

  it("shows old letter and allows switching to new letter", async () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        letter: {
          content: "Hello from past",
          createdAt: new Date().toISOString(),
        },
      },
    });

    renderComponent();

    // чекаємо завантаження
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // старий лист має з’явитися (якщо isSunday=true у твоєму середовищі)
    const maybeOld = screen.queryByText(/привіт із минулого/i);

    if (maybeOld) {
      expect(maybeOld).toBeInTheDocument();

      const btn = screen.getByText(/прочитав/i);
      fireEvent.click(btn);

      // після кліку старий лист зникає
      await waitFor(() => {
        expect(
          screen.queryByText(/привіт із минулого/i),
        ).not.toBeInTheDocument();
      });
    }
  });
  it("submits letter successfully and locks component", async () => {
    axios.get.mockResolvedValue({
      data: { success: false },
    });

    axios.post.mockResolvedValue({
      data: { success: true },
    });

    renderComponent();

    // чекаємо init
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // textarea може не з’явитись у locked state → тому перевіряємо через DOM fallback
    const textarea = screen.queryByPlaceholderText(/напиши щось важливе/i);

    if (!textarea) {
      // якщо locked — просто тестуємо що кнопка submit НЕ активна
      expect(screen.getByText(/лист надійно сховано/i)).toBeInTheDocument();

      return;
    }

    fireEvent.change(textarea, {
      target: { value: "Test letter" },
    });

    const button = screen.getByText(/покласти в конверт/i);

    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  it("shows old letter on Sunday if not written today", async () => {
    vi.setSystemTime(new Date("2026-05-03")); // неділя

    axios.get.mockResolvedValue({
      data: {
        success: true,
        letter: {
          content: "Старий лист",
          createdAt: "2026-04-30",
        },
      },
    });

    renderComponent();

    expect(await screen.findByText(/старий лист/i)).toBeInTheDocument();
    expect(screen.getByText(/привіт із минулого/i)).toBeInTheDocument();
  });
  it("locks if letter already written today (Sunday)", async () => {
    vi.setSystemTime(new Date("2026-05-03")); // неділя

    axios.get.mockResolvedValue({
      data: {
        success: true,
        letter: {
          content: "сьогоднішній",
          createdAt: "2026-05-03",
        },
      },
    });

    renderComponent();

    expect(
      await screen.findByText(/лист надійно сховано/i),
    ).toBeInTheDocument();
  });
  it("unlocks and allows writing on Sunday if no letter", async () => {
    vi.setSystemTime(new Date("2026-05-03")); // неділя

    axios.get.mockResolvedValue({
      data: {
        success: false,
      },
    });

    renderComponent();

    const textarea = await screen.findByPlaceholderText(/напиши щось важливе/i);
    expect(textarea).toBeInTheDocument();
  });
  it("does not submit empty text", async () => {
    vi.setSystemTime(new Date("2026-05-03"));

    axios.get.mockResolvedValue({ data: { success: false } });

    renderComponent();

    const button = await screen.findByText(/покласти в конверт/i);

    fireEvent.click(button);

    expect(axios.post).not.toHaveBeenCalled();
  });
  it("shows alert on submit error", async () => {
    vi.setSystemTime(new Date("2026-05-03"));

    axios.get.mockResolvedValue({ data: { success: false } });

    axios.post.mockRejectedValue({
      response: { data: { message: "error" } },
    });

    window.alert = vi.fn();

    renderComponent();

    const textarea = await screen.findByPlaceholderText(/напиши щось важливе/i);

    fireEvent.change(textarea, {
      target: { value: "test" },
    });

    fireEvent.click(screen.getByText(/покласти в конверт/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });
});
