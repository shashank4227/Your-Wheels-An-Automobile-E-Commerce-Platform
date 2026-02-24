import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BuyerTransaction from "../src/Buyer/BuyerTransaction";
import axios from "axios";
import { describe, it, afterEach, vi, expect } from "vitest";
import '@testing-library/jest-dom';


// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Utility render function with router
const renderWithRouter = (ui, { route = "/transactions/123", path = "/transactions/:id" } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe("BuyerTransaction Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("displays an error message when transactions fail to load", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <BuyerTransaction />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText((content, element) =>
          element.textContent === "Error loading transactions"
        )
      ).toBeInTheDocument();
    });
  });
  it("toggles subscription filter", async () => {
    const mockTransactions = [
      { _id: 1, type: "subscription", amount: 1000, createdAt: new Date(), status: "active" },
      { _id: 2, type: "purchase", amount: 500, createdAt: new Date(), status: "completed" }
    ];

    axios.get.mockResolvedValue({ data: mockTransactions });

    renderWithRouter(<BuyerTransaction />);

    const subscriptionButton = screen.getByText(/Show Subscriptions/i);

    await waitFor(() => {
      expect(screen.getByText((text) => text.includes("₹1,000"))).toBeInTheDocument();
    });

    fireEvent.click(subscriptionButton);

    await waitFor(() => {
      expect(screen.queryByText((text) => text.includes("₹1,000"))).not.toBeInTheDocument();
    });
  });

  it("toggles purchase filter", async () => {
    const mockTransactions = [
      { _id: "1", type: "purchase", amount: 800, createdAt: new Date(), status: "Completed" },
      { _id: "2", type: "subscription", amount: 500, createdAt: new Date(), status: "Active" },
    ];

    axios.get.mockResolvedValue({ data: mockTransactions });

    render(
      <MemoryRouter initialEntries={["/buyer-transactions/123"]}>
        <Routes>
          <Route path="/buyer-transactions/:id" element={<BuyerTransaction />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Purchase")).toBeInTheDocument();
      expect(screen.getByText("Subscription")).toBeInTheDocument();
    });

    const purchaseToggle = screen.getByRole("button", { name: /Show Purchases/i });

    fireEvent.click(purchaseToggle);

    await waitFor(() => {
      expect(screen.queryByText("Purchase")).not.toBeInTheDocument();
      expect(screen.getByText("Subscription")).toBeInTheDocument();
    });
  });

  it("toggles rental filter correctly", async () => {
    const mockTransactions = [
      {
        _id: "1",
        type: "rental",
        amount: 450,
        createdAt: new Date().toISOString(),
        status: "completed",
      },
      {
        _id: "2",
        type: "purchase",
        amount: 1000,
        createdAt: new Date().toISOString(),
        status: "completed",
      },
    ];

    axios.get.mockResolvedValue({ data: mockTransactions });

    render(
      <MemoryRouter initialEntries={["/buyer-transactions/123"]}>
        <Routes>
          <Route path="/buyer-transactions/:id" element={<BuyerTransaction />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Rental")).toBeInTheDocument();
    });

    const rentalToggle = screen.getByRole("button", { name: /Show Rentals/i });
    fireEvent.click(rentalToggle);

    await waitFor(() => {
      expect(screen.queryByText("Rental")).not.toBeInTheDocument();
      expect(screen.getByText("Purchase")).toBeInTheDocument();
    });
  });

  it("displays no transactions if all filters are off", async () => {
    const mockTransactions = [
      { _id: 1, type: "rental", amount: 100, createdAt: new Date(), status: "done" }
    ];

    axios.get.mockResolvedValue({ data: mockTransactions });

    renderWithRouter(<BuyerTransaction />);

    fireEvent.click(screen.getByText(/Show Rentals/i));
    fireEvent.click(screen.getByText(/Show Purchases/i));
    fireEvent.click(screen.getByText(/Show Subscriptions/i));

    await waitFor(() => {
      expect(screen.queryByText(/Status:/i)).not.toBeInTheDocument();
    });
  });
});
