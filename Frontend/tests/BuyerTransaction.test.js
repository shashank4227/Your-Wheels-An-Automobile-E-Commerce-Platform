import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BuyerTransaction from "../src/Buyer/BuyerTransaction";
import axios from "axios";

// Mock axios
jest.mock("axios");

// Utility render with Router and route param
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
    jest.clearAllMocks();
  });

  
  it("displays an error message when transactions fail to load", async () => {
    // Mock API failure
    axios.get.mockRejectedValue(new Error("Failed to load transactions"));

    // Create a spy on console.error to ensure it gets called
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/buyer-transactions/123"]}>
        <Routes>
          <Route path="/buyer-transactions/:id" element={<BuyerTransaction />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error loading transactions/i)).toBeInTheDocument();
    });

    // Verify that console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading transactions");

    // Restore console.error
    consoleErrorSpy.mockRestore();
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

    // Ensure both transactions are visible initially
    await waitFor(() => {
      expect(screen.getByText("Purchase")).toBeInTheDocument();
      expect(screen.getByText("Subscription")).toBeInTheDocument();
    });

    const purchaseToggle = screen.getByRole("button", { name: /Show Purchases/i });

    // Toggle off purchases
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

    // Ensure rental appears
    await waitFor(() => {
      expect(screen.getByText("Rental")).toBeInTheDocument();
    });

    const rentalToggle = screen.getByRole("button", { name: /Show Rentals/i });
    fireEvent.click(rentalToggle); // Hide rentals

    // Rental should no longer be present
    await waitFor(() => {
      expect(screen.queryByText("Rental")).not.toBeInTheDocument();
      expect(screen.getByText("Purchase")).toBeInTheDocument(); // Confirm others remain
    });
  });

  it("displays no transactions if all filters are off", async () => {
    const mockTransactions = [
      { _id: 1, type: "rental", amount: 100, createdAt: new Date(), status: "done" }
    ];

    axios.get.mockResolvedValue({ data: mockTransactions });

    renderWithRouter(<BuyerTransaction />);

    // Disable all filters
    fireEvent.click(screen.getByText(/Show Rentals/i));
    fireEvent.click(screen.getByText(/Show Purchases/i));
    fireEvent.click(screen.getByText(/Show Subscriptions/i));

    // Wait and then check that no transaction-item elements are shown
    await waitFor(() => {
      expect(screen.queryByText(/Status:/i)).not.toBeInTheDocument();
    });
  });
});
