import { render, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";
import React, { useContext } from "react";

import AppContextProvider, { AppContext } from "../context/AppContext";

// ---------------- MOCKS ----------------
vi.mock("axios");

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { toast } from "react-toastify";

// ---------------- TEST CONSUMER ----------------
const TestComponent = () => {
  const ctx = useContext(AppContext);
  return (
    <div>
      <p data-testid="logged">{String(ctx.isLoggedin)}</p>
      <p data-testid="user">{JSON.stringify(ctx.userData)}</p>
    </div>
  );
};

// ---------------- RENDER ----------------
const renderWithProvider = () =>
  render(
    <AppContextProvider>
      <TestComponent />
    </AppContextProvider>,
  );

// ---------------- TESTS ----------------
describe("AppContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides default values", async () => {
    axios.get.mockRejectedValue(new Error("fail"));

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId("logged").textContent).toBe("false");
    });
  });

  it("sets logged in and loads user data", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: { success: true },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          userData: { name: "Alex" },
        },
      });

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId("logged").textContent).toBe("true");
      expect(getByTestId("user").textContent).toContain("Alex");
    });
  });

  it("handles auth failure gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("auth error"));

    renderWithProvider();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("handles user data failure", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: { success: true },
      })
      .mockRejectedValueOnce(new Error("user error"));

    renderWithProvider();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("exposes context functions", async () => {
    axios.get.mockResolvedValue({
      data: { success: false },
    });

    let ctxRef;

    const Probe = () => {
      ctxRef = useContext(AppContext);
      return null;
    };

    render(
      <AppContextProvider>
        <Probe />
      </AppContextProvider>,
    );

    await waitFor(() => {
      expect(typeof ctxRef.getUserData).toBe("function");
      expect(typeof ctxRef.setIsLoggedin).toBe("function");
    });
  });
});
