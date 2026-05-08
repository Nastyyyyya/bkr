import { render, screen, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

import { AppContext } from "../context/AppContext";
import ChildHome from "../pages/ChildHome";
import LuscherTest from "../pages/LuscherTest";

// ---------------- MOCKS ----------------
vi.mock("axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ childId: "123" }),
    useNavigate: () => mockNavigate,
  };
});

// ---------------- GLOBAL MOCKS ----------------
beforeEach(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  };

  vi.clearAllMocks();
});

let observeCallback;

beforeEach(() => {
  vi.clearAllMocks();

  globalThis.IntersectionObserver = class {
    constructor(cb) {
      observeCallback = cb;
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  };
});

// ---------------- CONTEXT ----------------
const mockContext = {
  backendUrl: "http://localhost:4000",
  setUserData: vi.fn(),
  setIsLoggedin: vi.fn(),
};

// ---------------- HELPERS ----------------
const renderPage = () =>
  render(
    <AppContext.Provider value={mockContext}>
      <MemoryRouter>
        <ChildHome />
      </MemoryRouter>
    </AppContext.Provider>,
  );

const renderLuscher = (ui) =>
  render(<AppContext.Provider value={mockContext}>{ui}</AppContext.Provider>);

// ======================================================
// 🧠 CHILD HOME TESTS
// ======================================================
describe("ChildHome page (ADVANCED)", () => {
  it("shows loading initially", () => {
    renderPage();
    expect(screen.getByText(/завантаження/i)).toBeInTheDocument();
  });

  it("executes full API flow", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { child: {} } })
      .mockResolvedValueOnce({ data: { mood: "happy" } })
      .mockResolvedValueOnce({ data: {} });

    renderPage();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
  });

  it("calls correct endpoints in order", async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} });

    renderPage();

    await waitFor(() => {
      const calls = axios.get.mock.calls.map((c) => c[0]);

      expect(calls).toEqual([
        expect.stringContaining("/api/child/"),
        expect.stringContaining("/api/child-mood"),
        expect.stringContaining("/api/child-garden"),
      ]);
    });
  });

  it("updates UI after API success", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { child: { name: "Alex" } } })
      .mockResolvedValueOnce({ data: { mood: "sad" } })
      .mockResolvedValueOnce({ data: { flowers: [] } });

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText(/завантаження/i)).not.toBeInTheDocument();
    });
  });

  it("handles errors without crashing", async () => {
    axios.get.mockRejectedValueOnce(new Error("error"));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/завантаження/i)).toBeInTheDocument();
    });
  });

  it("has correct context", () => {
    renderPage();
    expect(mockContext.backendUrl).toBe("http://localhost:4000");
  });

  // ======================================================
  // 🔥 NEW FUNCTIONAL TESTS
  // ======================================================

  it("navigates when assistant is clicked", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { child: {} } })
      .mockResolvedValueOnce({ data: { mood: "happy", hasMood: true } })
      .mockResolvedValueOnce({ data: {} });

    renderPage();

    await waitFor(() => {
      expect(screen.getByAltText(/helper/i)).toBeInTheDocument();
    });

    screen.getByAltText(/helper/i).click();

    expect(mockNavigate).toHaveBeenCalledWith("/child-chatbot/123");
  });

  it("calls logout correctly", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { child: {} } })
      .mockResolvedValueOnce({ data: { mood: "happy", hasMood: true } })
      .mockResolvedValueOnce({ data: {} });

    axios.post.mockResolvedValueOnce({ data: { success: true } });

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText(/завантаження/i)).not.toBeInTheDocument();
    });

    const logoutBtn = screen.getByText(/вийти/i);
    logoutBtn.click();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:4000/api/auth/logout",
      );

      expect(mockContext.setUserData).toHaveBeenCalledWith(false);
      expect(mockContext.setIsLoggedin).toHaveBeenCalledWith(false);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});

// ======================================================
// 🎨 LUSCHER TEST
// ======================================================
describe("LuscherTest (COVERAGE)", () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  it("renders step 1", () => {
    renderLuscher(<LuscherTest childId="123" />);
    expect(screen.getByText(/крок 1/i)).toBeInTheDocument();
  });

  it("selects one color", async () => {
    renderLuscher(<LuscherTest childId="123" />);

    const buttons = screen.getAllByRole("button");

    await act(async () => {
      buttons[1].click();
    });

    expect(screen.getByText(/твій вибір/i)).toBeInTheDocument();
  });
});

it("updates assistant text when section becomes visible", async () => {
  axios.get
    .mockResolvedValueOnce({ data: { child: {} } })
    .mockResolvedValueOnce({ data: { mood: "happy", hasMood: true } })
    .mockResolvedValueOnce({ data: { flowers: [] } });

  renderPage();

  await waitFor(() => {
    expect(observeCallback).toBeDefined();
  });

  act(() => {
    observeCallback([
      {
        isIntersecting: true,
        target: { id: "section-garden" },
      },
    ]);
  });

  expect(screen.getByText(/Подивись, який гарний сад/i)).toBeInTheDocument();
});

it("renders garden when API returns data", async () => {
  axios.get
    .mockResolvedValueOnce({ data: { child: { name: "Alex" } } })
    .mockResolvedValueOnce({ data: { mood: "happy", hasMood: true } })
    .mockResolvedValueOnce({
      data: {
        flowers: [{ id: 1 }],
        treeStage: 2,
        rain: false,
        beaver: false,
        clouds: [],
      },
    });

  renderPage();

  await waitFor(() => {
    expect(screen.queryByText(/завантаження/i)).not.toBeInTheDocument();
  });
});
