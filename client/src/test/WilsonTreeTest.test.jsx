import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import axios from "axios";
import WilsonTreeTest from "../components/WilsonTreeTest";

// mock axios
vi.mock("axios");

// mock картинки (щоб не падало)
vi.mock("../assets/assets", () => ({
  assets: {
    blob_tree: "test-image.png",
  },
}));

describe("WilsonTreeTest", () => {
  const backendUrl = "http://localhost:5000";
  const childId = "123";

  it("renders component", () => {
    render(<WilsonTreeTest childId={childId} backendUrl={backendUrl} />);

    expect(screen.getByText(/де ти на дереві/i)).toBeInTheDocument();
  });

  it("renders 21 buttons", () => {
    render(<WilsonTreeTest childId={childId} backendUrl={backendUrl} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(21);
  });

  it("selects number and sends request", async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    render(<WilsonTreeTest childId={childId} backendUrl={backendUrl} />);

    const button = screen.getByText("5");
    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${backendUrl}/api/wilson/save`, {
        childId,
        selectedId: 5,
      });
    });
  });

  it("shows selected number", async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    render(<WilsonTreeTest childId={childId} backendUrl={backendUrl} />);

    fireEvent.click(screen.getByText("3"));

    await waitFor(() => {
      expect(screen.getByText(/твій вибір: номер 3/i)).toBeInTheDocument();
    });
  });

  it("calls onSelect callback", async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    const onSelectMock = vi.fn();

    render(
      <WilsonTreeTest
        childId={childId}
        backendUrl={backendUrl}
        onSelect={onSelectMock}
      />,
    );

    fireEvent.click(screen.getByText("7"));

    await waitFor(() => {
      expect(onSelectMock).toHaveBeenCalledWith(7);
    });
  });

  it("handles error without crashing", async () => {
    axios.post.mockRejectedValue(new Error("error"));

    render(<WilsonTreeTest childId={childId} backendUrl={backendUrl} />);

    fireEvent.click(screen.getByText("2"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
