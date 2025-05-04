import '@testing-library/jest-dom';
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminDashBoard from "../src/Admin/AdminDashBoard";
import axios from "axios";
import React from "react";

// Mock axios and AdminSideBar
jest.mock("axios");
jest.mock("../src/Admin/AdminSideBar", () => ({ activeLink, email }) => (
  <div data-testid="mock-sidebar">
    <div>Mocked Sidebar</div>
    <div data-testid="active-link">{activeLink}</div>
    <div data-testid="admin-email">{email}</div>
  </div>
));

const renderWithRouter = (email = "admin@example.com") => {
    render(
      <MemoryRouter initialEntries={[`/admin-dashboard/${email}`]}>
        <Routes>
          <Route path="/admin-dashboard/:email" element={<AdminDashBoard />} />
        </Routes>
      </MemoryRouter>
    );
  };

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  Users: () => <div data-testid="users-icon">Users Icon</div>,
  DollarSign: () => <div data-testid="dollar-icon">Dollar Icon</div>,
  TrendingUp: () => <div data-testid="trending-icon">Trending Icon</div>,
  Store: () => <div data-testid="store-icon">Store Icon</div>,
  CheckCircle: () => <div data-testid="check-icon">Check Icon</div>,
  Trash2: () => <div data-testid="trash-icon">Trash Icon</div>,
  Mail: () => <div data-testid="mail-icon">Mail Icon</div>
}));

// Mock data for buyers and sellers
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

// Helper function to render the AdminDashBoard with router
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
    // Mock the axios call to return the mock user data
      axios.get.mockResolvedValue({ data: mockUsersData });
     
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders with admin email from URL params", async () => {
    renderDashboard("admin@test.com");
  
    await waitFor(() => {
      const emailMatches = screen.getAllByText("admin@test.com");
      expect(emailMatches.length).toBeGreaterThanOrEqual(1); // or 2 if both sidebar & main render it
      expect(screen.getByText(/Admin Email:/i)).toBeInTheDocument();
    });
  });
  

  test("displays correct user statistics after loading", async () => {
    renderDashboard();
    
    // Ensure the loading state
    expect(screen.queryByText(mockUsersData.buyers.length.toString())).not.toBeInTheDocument();
    
    // After data loads, check the statistics
    await waitFor(() => {
      expect(screen.getByText(mockUsersData.buyers.length.toString())).toBeInTheDocument();
      expect(screen.getByText(mockUsersData.sellers.length.toString())).toBeInTheDocument();
    });
  });

  test("renders all dashboard sections correctly", async () => {
    renderDashboard();
    
    await waitFor(() => {
      // Check the main sections
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Overview of platform performance")).toBeInTheDocument();
      
      // Check stat cards
      expect(screen.getByText("Total Buyers")).toBeInTheDocument();
      expect(screen.getByText("Total Sellers")).toBeInTheDocument();
      
      // Check icons are rendered
      expect(screen.getAllByTestId("users-icon").length).toBe(2);
      expect(screen.getByTestId("store-icon")).toBeInTheDocument();
      expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
    });
  });

  test("passes correct props to AdminSideBar", async () => {
    renderDashboard("test@admin.com");
    
    await waitFor(() => {
      const sidebar = screen.getByTestId("mock-sidebar");
      expect(within(sidebar).getByTestId("admin-email")).toHaveTextContent("test@admin.com");
      expect(within(sidebar).getByTestId("active-link")).toHaveTextContent("/admin-dashboard/test@admin.com");
    });
  });

  test("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));
    renderDashboard();
  
    await waitFor(() => {
      // Check that both buyer and seller counts fall back to "0"
      const countElements = screen.getAllByText("0");
      expect(countElements.length).toBeGreaterThanOrEqual(2);
  
      // Optional: check that Total Buyers/Sellers sections are still visible
      expect(screen.getByText("Total Buyers")).toBeInTheDocument();
      expect(screen.getByText("Total Sellers")).toBeInTheDocument();
    });
  });
  

  test("matches loading state before data fetch", () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
  
    renderDashboard();
  
    // Check section titles render
    expect(screen.getByText("Total Buyers")).toBeInTheDocument();
    expect(screen.getByText("Total Sellers")).toBeInTheDocument();
  
    // Check that mockUsersData values are NOT present yet
    expect(screen.queryByText("2")).not.toBeInTheDocument(); // buyers.length
    expect(screen.queryByText("3")).not.toBeInTheDocument(); // sellers.length
  });
  
  // Add more tests as needed to verify the behavior
});
