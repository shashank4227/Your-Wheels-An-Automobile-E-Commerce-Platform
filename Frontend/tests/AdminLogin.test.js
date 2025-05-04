import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminLogin from "../src/Admin/AdminLogin";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import React from "react";
// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock axios
jest.mock("axios");

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AdminLogin />
    </MemoryRouter>
  );

describe("AdminLogin Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.post = jest.fn(); // Ensure axios.post is defined and mockable
  });

  test("renders login form and rotating image", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Admin Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByText("Welcome Admin 👨‍💻")).toBeInTheDocument();
  });

  test("updates input fields on change", () => {
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Admin Email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "mypassword" },
    });

    expect(screen.getByDisplayValue("admin@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("mypassword")).toBeInTheDocument();
  });

  test("toggles password visibility when eye icon is clicked", () => {
    renderLogin();
  
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput).toHaveAttribute("type", "password");
  
    // Find the button containing the eye icon and click it to toggle visibility
    const eyeIconButton = screen.getByRole("button", { name: /toggle password visibility/i });
  
    fireEvent.click(eyeIconButton); // First click should change input type to text
    expect(passwordInput).toHaveAttribute("type", "text");
  
    fireEvent.click(eyeIconButton); // Second click should change input type back to password
    expect(passwordInput).toHaveAttribute("type", "password");
  });
  

  test("shows error if email or password is missing", async () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText("Email is required!")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Admin Email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText("Password is required!")).toBeInTheDocument();
    });
  });

  test("logs in successfully and navigates to dashboard", async () => {
    axios.post.mockResolvedValue({
      data: { token: "abc123", email: "admin@example.com" },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Admin Email"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "secretpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3000/admin-login",
        { email: "admin@example.com", password: "secretpass" }
      );
      expect(mockNavigate).toHaveBeenCalledWith("/admin-dashboard/admin@example.com");
    });
  });

  test("shows error on failed login", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Admin Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});
