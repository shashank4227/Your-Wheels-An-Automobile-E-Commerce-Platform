import React from "react";
import { render, screen,within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SellerDashBoard from "../src/Seller/SellerDashBoard";
import axios from "axios";

// ✅ Mock data for stats and user
const mockStats = {
  totalVehiclesSold: 10,  // This must be included
  totalRentals: 5,
  totalRevenue: 75000,
  totalVehiclesOnSale: 4,
  totalVehicleOnRent: 2,
};

const mockUser = {
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  createdAt: "2023-12-01T00:00:00Z",
  profilePicture: "",
  role: "seller",
};

// ✅ Mock axios globally
jest.mock("axios");

// ✅ Reusable render function with routing context
const renderWithRouter = (id = "123") => {
  return render(
    <MemoryRouter initialEntries={[`/seller-dashboard/${id}`]}>
      <Routes>
        <Route path="/seller-dashboard/:id" element={<SellerDashBoard />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("SellerDashBoard Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    axios.get.mockImplementation((url) => {
      if (url.includes("/seller-stats/")) {
        return Promise.resolve({ data: mockStats });
      }
      if (url.includes("/seller/")) {
        return Promise.resolve({ data: mockUser });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
  });

  test("renders dashboard title", async () => {
    renderWithRouter();
    expect(await screen.findByText(/Seller Dashboard/i)).toBeInTheDocument();
  });

  test("shows seller full name", async () => {
    renderWithRouter();
    expect(await screen.findByText(/Alice Smith/)).toBeInTheDocument();
  });

  test("shows total revenue in dollars", async () => {
    renderWithRouter();
    expect(await screen.findByText(/\$75,000/)).toBeInTheDocument();
    // Or if you're using test-id:
    // const revenue = await screen.findByTestId("total-revenue");
    // expect(revenue).toHaveTextContent("$75,000");
  });

  test("shows total vehicles sold", async () => {
    renderWithRouter();
    
    // Find the specific vehicles sold card using test-id
    const vehiclesSoldCard = await screen.findByTestId("total-vehicles-sold-card");
    
    // Within that card, find the value element
    const vehiclesSoldValue = within(vehiclesSoldCard).getByTestId("total-vehicles-sold");
    
    expect(vehiclesSoldValue).toHaveTextContent("10");
  });
  test("shows total rentals", async () => {
    renderWithRouter();
    
    // Find the specific rentals card using test-id
    const rentalsCard = await screen.findByTestId("total-rentals-card");
    
    // Within that card, find the value element
    const rentalsValue = within(rentalsCard).getByTestId("total-rentals");
    
    expect(rentalsValue).toHaveTextContent("5");
  });
  test("shows error message when API fails", async () => {
    // Mock both API calls to fail
    axios.get.mockImplementation((url) => {
      return Promise.reject(new Error("API Error"));
    });
  
    renderWithRouter();
    
    // Wait for the error container to appear
    const errorContainer = await screen.findByTestId("error-container", {}, { timeout: 3000 });
    expect(errorContainer).toBeInTheDocument();
    
    // Verify the error title
    const errorTitle = await screen.findByText("Error Loading Dashboard");
    expect(errorTitle).toBeInTheDocument();
    
    // Verify the error message (API Error)
    const errorMessage = await screen.findByText(/API Error/);
    expect(errorMessage).toBeInTheDocument();
    
    // Verify the retry button exists
    const retryButton = await screen.findByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });
});