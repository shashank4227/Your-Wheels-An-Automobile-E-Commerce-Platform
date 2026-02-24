import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminDashBoard from "../src/Admin/AdminDashBoard";
import axios from "axios";
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import '@testing-library/jest-dom';

// Mock axios
vi.mock("axios");

// Mock AdminSideBar
vi.mock("../src/Admin/AdminSideBar", () => ({
  default: ({ activeLink, email }) => (
    <div data-testid="mock-sidebar">
      <div>Mocked Sidebar</div>
      <div data-testid="active-link">{activeLink}</div>
      <div data-testid="admin-email">{email}</div>
    </div>
  ),
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Users: () => <div data-testid="users-icon">Users Icon</div>,
  DollarSign: () => <div data-testid="dollar-icon">Dollar Icon</div>,
  TrendingUp: () => <div data-testid="trending-icon">Trending Icon</div>,
  Store: () => <div data-testid="store-icon">Store Icon</div>,
  CheckCircle: () => <div data-testid="check-icon">Check Icon</div>,
  Trash2: () => <div data-testid="trash-icon">Trash Icon</div>,
  Mail: () => <div data-testid="mail-icon">Mail Icon</div>,
}));

const mockUsersData = {
  buyers: [
    { id: 1, name: "Buyer One", email: "buyer1@example.com" },
    { id: 2, name: "Buyer Two", email: "buyer2@example.com" }
  ],
  sellers: [
    { id: 1, name: "Seller One", email: "seller1@example.com" },
    { id: 2, name: "Seller Two", email: "seller2@example.com" },
    { id: 3, name: "Seller Three", email: "seller3@example.com" }
  ]
};

const renderDashboard = (email = "admin@example.com") => {
  return render(
    <MemoryRouter initialEntries={[`/admin-dashboard/${email}`]}>
      <Routes>
        <Route path="/admin-dashboard/:email" element={<AdminDashBoard />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("AdminDashBoard Component", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockUsersData });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders with admin email from URL params", async () => {
    renderDashboard("admin@test.com");

    await waitFor(() => {
      const emailMatches = screen.getAllByText("admin@test.com");
      expect(emailMatches.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Admin Email:/i)).toBeInTheDocument();
    });
  });

  it("displays correct user statistics after loading", async () => {
    renderDashboard();

    expect(screen.queryByText(mockUsersData.buyers.length.toString())).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockUsersData.buyers.length.toString())).toBeInTheDocument();
      expect(screen.getByText(mockUsersData.sellers.length.toString())).toBeInTheDocument();
    });
  });

  it("renders all dashboard sections correctly", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Overview of platform performance")).toBeInTheDocument();
      expect(screen.getByText("Total Buyers")).toBeInTheDocument();
      expect(screen.getByText("Total Sellers")).toBeInTheDocument();
      expect(screen.getAllByTestId("users-icon").length).toBe(2);
      expect(screen.getByTestId("store-icon")).toBeInTheDocument();
      expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
    });
  });

  it("passes correct props to AdminSideBar", async () => {
    renderDashboard("test@admin.com");

    await waitFor(() => {
      const sidebar = screen.getByTestId("mock-sidebar");
      expect(within(sidebar).getByTestId("admin-email")).toHaveTextContent("test@admin.com");
      expect(within(sidebar).getByTestId("active-link")).toHaveTextContent("/admin-dashboard/test@admin.com");
    });
  });

  it("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));
    renderDashboard();

    await waitFor(() => {
      const countElements = screen.getAllByText("0");
      expect(countElements.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("Total Buyers")).toBeInTheDocument();
      expect(screen.getByText("Total Sellers")).toBeInTheDocument();
    });
  });

  it("matches loading state before data fetch", () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    renderDashboard();

    expect(screen.getByText("Total Buyers")).toBeInTheDocument();
    expect(screen.getByText("Total Sellers")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });
});
