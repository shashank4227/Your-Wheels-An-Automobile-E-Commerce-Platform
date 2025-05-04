import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";
import "./EditUser.css";
import React from "react";
const EditUser = () => {
  const { id: userId } = useParams(); // Get userId from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
   
  });

  useEffect(() => {
    // Fetch user details when component mounts
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/get-user/${userId}`
        );
        const data = await response.json();
        if (response.ok) {
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
           
          });
        } else {
          console.error("Error fetching user:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    if (userId) {
      fetchUser();
    } else {
      console.error("User ID is missing!");
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      console.error("User ID is missing!");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/update-user/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
           
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          }),
        }
      );

      const responseText = await response.text(); // Read response as text
      console.log("Raw API Response:", responseText); // Debug response

      if (!response.ok)
        throw new Error(`HTTP Error! Status: ${response.status}`);

      const data = JSON.parse(responseText); // Parse JSON manually
        console.log("Updated User:", data);
        const email = localStorage.getItem("email");
      navigate(`/admin-manage-users/${email}`, { state: { refresh: true } });
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <AdminSideBar activeLink="/admin-manage-users/:id" />
      </nav>
      <main className="main-content edit-user-container">
        <h2 style={{color:"white",fontSize:"40px"}}>Edit User</h2>
        <form onSubmit={handleSubmit} className="edit-user-form">
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
         
          <button type="submit">Update</button>
        </form>
      </main>
    </div>
  );
};

export default EditUser;
