import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminLogin from "../src/Admin/AdminLogin";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import '@testing-library/jest-dom';


// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock axios
vi.mock("axios");

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AdminLogin />
    </MemoryRouter>
  );

describe("AdminLogin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.post = vi.fn();
  });

  it("renders login form and rotating image", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Admin Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByText("Welcome Admin 👨‍💻")).toBeInTheDocument();
  });

  it("updates input fields on change", () => {
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

  it("toggles password visibility when eye icon is clicked", () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const eyeIconButton = screen.getByRole("button", { name: /toggle password visibility/i });

    fireEvent.click(eyeIconButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(eyeIconButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows error if email or password is missing", async () => {
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

  it("logs in successfully and navigates to dashboard", async () => {
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

  it("shows error on failed login", async () => {
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
