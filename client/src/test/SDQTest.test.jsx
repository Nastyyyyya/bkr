import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";

import SDQTest from "../components/SDQTest";

vi.mock("axios");

beforeEach(() => {
  vi.clearAllMocks();
});

const mockTest = {
  questions: [
    { text: "Q1", scale: "emotional", reverse: false },
    { text: "Q2", scale: "conduct", reverse: false },
  ],
};

const renderComponent = (props = {}) => {
  return render(
    <SDQTest childId="123" backendUrl="http://localhost:4000" {...props} />,
  );
};

describe("SDQTest", () => {
  it("shows loading initially", async () => {
    axios.get.mockResolvedValueOnce({ data: mockTest });

    renderComponent();

    expect(screen.getByText(/готуємо питання/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Q1")).toBeInTheDocument();
    });
  });

  it("renders first question", async () => {
    axios.get.mockResolvedValueOnce({ data: mockTest });

    renderComponent();

    expect(await screen.findByText("Q1")).toBeInTheDocument();
  });

  it("selects answer", async () => {
    axios.get.mockResolvedValueOnce({ data: mockTest });

    renderComponent();

    const buttons = await screen.findAllByRole("button");

    fireEvent.click(buttons[0]);

    expect(buttons[0]).toBeDefined();
  });

  it("goes to next question", async () => {
    axios.get.mockResolvedValueOnce({ data: mockTest });

    renderComponent();

    const answerButtons = await screen.findAllByRole("button");

    fireEvent.click(answerButtons[0]);

    const nextButton = screen.getByText(/далі/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Q2")).toBeInTheDocument();
    });
  });

  it("finishes test and shows success screen", async () => {
    axios.get.mockResolvedValueOnce({ data: mockTest });
    axios.post.mockResolvedValueOnce({ data: {} });

    renderComponent();

    const answerButtons = await screen.findAllByRole("button");

    fireEvent.click(answerButtons[0]);
    fireEvent.click(screen.getByText(/далі/i));

    await waitFor(() => screen.getByText("Q2"));
    const buttons2 = screen.getAllByRole("button");

    fireEvent.click(buttons2[1]); // choose second option
    fireEvent.click(screen.getByText(/завершити/i));

    await waitFor(() => {
      expect(screen.getByText(/ти молодець/i)).toBeInTheDocument();
    });
  });

  it("sends results to API on finish", async () => {
    axios.get.mockResolvedValueOnce({ data: mockTest });
    axios.post.mockResolvedValueOnce({ data: {} });

    renderComponent();

    const buttons = await screen.findAllByRole("button");

    fireEvent.click(buttons[0]);
    fireEvent.click(screen.getByText(/далі/i));

    await waitFor(() => screen.getByText("Q2"));

    const buttons2 = screen.getAllByRole("button");
    fireEvent.click(buttons2[1]);

    fireEvent.click(screen.getByText(/завершити/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:4000/api/sdq-test/submit-result",
        expect.objectContaining({
          childId: "123",
          scores: expect.any(Object),
        }),
      );
    });
  });
});
