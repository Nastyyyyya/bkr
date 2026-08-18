import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import ChildrenAnxietyMeter from "../components/ChildrenAnxietyMeter";

beforeEach(() => {
  vi.clearAllMocks();

  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      json: async () => ({ success: true }),
    }),
  );
});

const renderComponent = (props = {}) =>
  render(
    <ChildrenAnxietyMeter
      childId="123"
      backendUrl="http://localhost:4000"
      {...props}
    />,
  );

describe("ChildrenAnxietyMeter", () => {
  it("renders component correctly", () => {
    renderComponent();

    expect(screen.getByText(/термометр тривожності/i)).toBeInTheDocument();
    expect(screen.getByText(/зберегти результат/i)).toBeInTheDocument();
  });

  it("changes anxiety level when clicking number", () => {
    renderComponent();

    const btn = screen.getByText("9");
    fireEvent.click(btn);

    expect(btn.className).toContain("bg-[#2c4832]");
  });

  it("shows correct emoji for high anxiety", () => {
    renderComponent();

    fireEvent.click(screen.getByText("9"));

    expect(screen.getByText("😡")).toBeInTheDocument();
  });

  it("calls API on save", async () => {
    renderComponent();

    fireEvent.click(screen.getByText(/зберегти результат/i));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it("shows loading state while saving", async () => {
    renderComponent();

    fireEvent.click(screen.getByText(/зберегти результат/i));

    expect(screen.getByText(/збереження/i)).toBeInTheDocument();
  });

  it("shows success message after save", async () => {
    renderComponent();

    fireEvent.click(screen.getByText(/зберегти результат/i));

    await waitFor(() => {
      expect(screen.getByText(/твій стан записано/i)).toBeInTheDocument();
    });
  });

  it("prevents changes after submit", async () => {
    renderComponent();

    fireEvent.click(screen.getByText(/зберегти результат/i));

    await waitFor(() => {
      expect(screen.getByText(/твій стан записано/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("10"));

    expect(screen.getByText(/твій стан записано/i)).toBeInTheDocument();
  });
});
