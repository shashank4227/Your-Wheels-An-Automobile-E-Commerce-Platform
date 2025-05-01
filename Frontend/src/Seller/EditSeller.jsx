import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SideBar from "./SellerSideBar";

const EditSeller = () => {
  const { id: userId } = useParams(); // Get userId from URL
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming you store JWT token

        if (!token) {
          setError("Unauthorized: Please log in.");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-user/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.statusText}`);
        }

        const data = await response.json();
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error(error);
        setError("Failed to fetch user data.");
      }
    };

    if (userId) {
      fetchUser();
    } else {
      setError("User ID is missing!");
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("User ID is missing!");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Authorization token

      if (!token) {
        setError("Unauthorized: Please log in.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/update-user/${userId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();
      console.log("Raw API Response:", responseText);

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = responseText ? JSON.parse(responseText) : {};
      console.log("Updated User:", data);

      navigate(`/seller-dashboard/${userId}`, { state: { refresh: true } });
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user.");
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={location.pathname} id={userId} />
      </nav>
      <main className="main-content edit-user-container">
        <h2 style={{ color: "white", fontSize: "40px" }}>Edit Seller</h2>
        
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit} className="edit-user-form">
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Update</button>
        </form>
      </main>
    </div>
  );
};

export default EditSeller;
