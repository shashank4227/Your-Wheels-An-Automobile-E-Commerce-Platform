import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DashBoard from "../src/Buyer/BuyerDashBoard";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import '@testing-library/jest-dom';

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockUser = {
  firstName: "Jane",
  lastName: "Smith",
  email: "jane.smith@example.com",
  createdAt: "2022-01-15T00:00:00Z",
  profilePicture: "https://example.com/profile.jpg",
  role: "buyer",
};

const mockStats = {
  totalVehiclesBought: 5,
  totalRentedVehicles: 3,
  totalRevenue: 75000,
};

const renderWithRouter = (ui, { route = "/buyer-dashboard/123" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/buyer-dashboard/:id" element={ui} />
        <Route path="/edit-buyer/:id" element={<div>Edit Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("DashBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("buyerId", "123");
  });

  it("renders user profile and stats correctly", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("buyer-stats")) return Promise.resolve({ data: mockStats });
      if (url.includes("buyer")) return Promise.resolve({ data: mockUser });
    });

    renderWithRouter(<DashBoard />);

    await waitFor(() => {
      expect(screen.getByText("Buyer Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/jane.smith@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Total Vehicles Bought/)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/₹75,000/)).toBeInTheDocument();
  });

  it("navigates to edit page when Update button is clicked", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("buyer-stats")) return Promise.resolve({ data: mockStats });
      if (url.includes("buyer")) return Promise.resolve({ data: mockUser });
    });

    renderWithRouter(<DashBoard />);

    await waitFor(() => {
      expect(screen.getByText(/Update/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Update/));
    expect(screen.getByText(/Edit Page/)).toBeInTheDocument();
  });
});
