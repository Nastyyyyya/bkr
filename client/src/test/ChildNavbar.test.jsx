import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

import ChildNavbar from "../components/ChildNavbar";
import { AppContext } from "../context/AppContext";

vi.mock("axios");

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from "react-toastify";

const setUserData = vi.fn();
const setIsLoggedin = vi.fn();

const mockContext = {
  backendUrl: "http://localhost:4000",
  setUserData,
  setIsLoggedin,
};

const renderNavbar = (initialRoute = "/child-home/123") => {
  return render(
    <AppContext.Provider value={mockContext}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="*" element={<ChildNavbar />} />
        </Routes>
      </MemoryRouter>
    </AppContext.Provider>,
  );
};

describe("ChildNavbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navbar buttons", () => {
    renderNavbar();

    expect(screen.getByTitle("Казки")).toBeInTheDocument();
    expect(screen.getByTitle("Чат-бот")).toBeInTheDocument();
    expect(screen.getByTitle("Ігри")).toBeInTheDocument();
  });

  it("calls logout API and updates context", async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true },
    });

    renderNavbar();

    fireEvent.click(screen.getByText(/вийти/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:4000/api/auth/logout",
      );

      expect(setIsLoggedin).toHaveBeenCalledWith(false);
      expect(setUserData).toHaveBeenCalledWith(false);
    });
  });

  it("shows success toast on logout", async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true },
    });

    renderNavbar();

    fireEvent.click(screen.getByText(/вийти/i));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("shows error toast on logout failure", async () => {
    axios.post.mockRejectedValueOnce(new Error("fail"));

    renderNavbar();

    fireEvent.click(screen.getByText(/вийти/i));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
  it("sets axios withCredentials before logout", async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true },
    });

    renderNavbar();

    fireEvent.click(screen.getByText(/вийти/i));

    await waitFor(() => {
      expect(axios.defaults.withCredentials).toBe(true);
    });
  });
});

import { useNavigate } from "react-router-dom";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: () => ({ childId: "123" }),
  };
});

const mockNavigate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  useNavigate.mockReturnValue(mockNavigate);
});

it("redirects to home after successful logout", async () => {
  axios.post.mockResolvedValueOnce({
    data: { success: true },
  });

  renderNavbar();

  fireEvent.click(screen.getByText(/вийти/i));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

it("navigates to fairytales page", () => {
  renderNavbar();

  fireEvent.click(screen.getByTitle("Казки"));

  expect(mockNavigate).toHaveBeenCalledWith("/fairytales/123");
});

it("navigates to chatbot", () => {
  renderNavbar();

  fireEvent.click(screen.getByTitle("Чат-бот"));

  expect(mockNavigate).toHaveBeenCalledWith("/child-chatbot/123");
});

it("navigates to exercises", () => {
  renderNavbar();

  fireEvent.click(screen.getByTitle("Ігри"));

  expect(mockNavigate).toHaveBeenCalledWith("/exercises");
});
it("clicking logo navigates to child home", () => {
  renderNavbar();

  const logoContainer = screen.getByAltText("Logo").parentElement;

  fireEvent.click(logoContainer);

  expect(mockNavigate).toHaveBeenCalledWith("/child-home/123");
});
it("does not logout if success is false", async () => {
  axios.post.mockResolvedValueOnce({
    data: { success: false },
  });

  renderNavbar();

  fireEvent.click(screen.getByText(/вийти/i));

  await waitFor(() => {
    expect(setIsLoggedin).not.toHaveBeenCalled();
    expect(setUserData).not.toHaveBeenCalled();
  });
});

it("logs error on logout failure", async () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  axios.post.mockRejectedValueOnce(new Error("fail"));

  renderNavbar();

  fireEvent.click(screen.getByText(/вийти/i));

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalled();
  });

  consoleSpy.mockRestore();
});
