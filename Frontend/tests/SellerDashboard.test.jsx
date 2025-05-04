import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SellerDashBoard from "../src/Seller/SellerDashboard";
import axios from "axios";
import { describe, test, beforeEach, vi, expect } from "vitest";
import '@testing-library/jest-dom';

// Mock Chart.js components
vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
  // Add other chart types if your component uses them
}));

// Mock data
const mockStats = {
  totalVehiclesSold: 10,
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

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

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
    vi.clearAllMocks();
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
  });

  test("shows total vehicles sold with correct value", async () => {
    renderWithRouter();
    
    const vehiclesSold = await screen.findByTestId("vehicles-sold");
    expect(vehiclesSold).toBeInTheDocument();
    expect(vehiclesSold).toHaveTextContent("10");
  });
  
  test("shows total rentals with correct value", async () => {
    renderWithRouter();
    const rentals = await screen.findByTestId("total-rentals");
    expect(rentals).toBeInTheDocument();
    expect(rentals).toHaveTextContent("5");
  });
  
  
 
  

  test("renders doughnut chart for vehicle distribution", async () => {
    renderWithRouter();
    expect(await screen.findByTestId("doughnut-chart")).toBeInTheDocument();
  });

 
});