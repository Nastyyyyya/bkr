import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";

import MoodModal from "../components/MoodModal";

vi.mock("axios");

vi.mock("../components/MoodConfig", () => ({
  moods: [
    { id: "happy", emoji: "😀", label: "happy" },
    { id: "sad", emoji: "😢", label: "sad" },
  ],
  moodResponses: {
    happy: "Ти щасливий",
    sad: "Тобі сумно",
  },
}));

vi.mock("../assets/assets", () => ({
  assets: {
    header_img: "test-img.png",
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const renderModal = (props = {}) => {
  const defaultProps = {
    childId: "123",
    backendUrl: "http://localhost:4000",
    onYes: vi.fn(),
    onNo: vi.fn(),
  };

  return render(<MoodModal {...defaultProps} {...props} />);
};

describe("MoodModal", () => {
  it("renders step 1 moods", () => {
    renderModal();

    expect(screen.getByText(/обери настрій/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("goes to step 2 after mood click", async () => {
    renderModal();

    const emojis = screen.getAllByRole("button");

    fireEvent.click(emojis[0]);

    await waitFor(() => {
      expect(screen.getByText(/ти щасливий|тобі сумно/i)).toBeInTheDocument();
    });
  });

  it("calls axios.post when saving mood (YES flow)", async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    const onYes = vi.fn();

    renderModal({ onYes });

    const emojis = screen.getAllByRole("button");
    fireEvent.click(emojis[0]);

    const yesButton = await screen.findByText(/хочу поговорити/i);

    await act(async () => {
      fireEvent.click(yesButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(onYes).toHaveBeenCalled();
    });
  });

  it("calls onNo after saving mood", async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    const onNo = vi.fn();

    renderModal({ onNo });

    const emojis = screen.getAllByRole("button");
    fireEvent.click(emojis[0]);

    const noButton = await screen.findByText(/не зараз/i);

    await act(async () => {
      fireEvent.click(noButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(onNo).toHaveBeenCalled();
    });
  });

  it("shows loading state during save", async () => {
    let resolve;
    axios.post.mockReturnValue(
      new Promise((res) => {
        resolve = res;
      }),
    );

    renderModal();

    const emojis = screen.getAllByRole("button");
    fireEvent.click(emojis[0]);

    const yesButton = await screen.findByText(/хочу поговорити/i);
    fireEvent.click(yesButton);

    expect(screen.getByText(/завантаження/i)).toBeInTheDocument();

    await act(async () => {
      resolve({ data: {} });
    });
  });
});
