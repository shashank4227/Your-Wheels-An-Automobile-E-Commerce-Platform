import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./SellerDashboard.css";
import { Mail, Calendar, Edit } from "lucide-react";
import SideBar from "./SellerSideBar";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Car, Key, DollarSign, TrendingUp, Store, User } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Set API base URL from environment variable or use deployed URL as fallback
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://your-wheels-an-automobile-e-commerce.onrender.com";

function SellerDashBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch User Data on Load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log(`Fetching user data from: ${API_BASE_URL}/seller/${id}`);
        const response = await axios.get(`${API_BASE_URL}/seller/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        alert(`Failed to load user data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  // Handle Token Storage and URL Cleanup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("sellerId", id);

      // Clean up the URL to remove token (better for security)
      window.history.replaceState(
        {},
        document.title,
        `/seller-dashboard/${id}`
      );
    }
  }, [id, location.search]);

  const [stats, setStats] = useState({
    totalVehiclesSold: 0,
    totalRentals: 0,
    totalRevenue: 0,
    totalVehiclesOnSale: 0,
    totalVehicleOnRent: 0,
  });

  // Fetch Stats Data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log(`Fetching stats from: ${API_BASE_URL}/seller-stats/${id}`);
        const response = await axios.get(
          `${API_BASE_URL}/seller-stats/${id}`
        );
        
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        alert("Failed to load stats data");
      }
    };

    if (id) fetchStats();
  }, [id]);

  // Sample Data Definitions
  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales Revenue",
        data: [35000, 42000, 28000, 51000, 39000, 46000],
        backgroundColor: "#3b82f6",
      },
      {
        label: "Rental Revenue",
        data: [15000, 18000, 12000, 21000, 19000, 23000],
        backgroundColor: "#8b5cf6",
      },
    ],
  };

  const vehicleDistributionData = {
    labels: ["Vehicles on Sale", "Vehicles on Rent"],
    datasets: [
      {
        data: [stats.totalVehiclesOnSale, stats.totalVehicleOnRent],
        backgroundColor: ["#3b82f6", "#8b5cf6"],
      },
    ],
  };

  const transactionData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales Transactions",
        data: [3, 2, 4, 2, 3, 1],
        borderColor: "#3b82f6",
        tension: 0.4,
        fill: false,
      },
      {
        label: "Rental Listings",
        data: [2, 3, 1, 2, 2, 2],
        borderColor: "#8b5cf6",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  // Enhanced Logout Handling
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      navigate("/"); // Redirect to login page
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />
      </nav>

      <main className="main-content" style={{ backgroundColor: "#141414" }}>
        <br />
        <br />
        <div className="profile-container">
          <div className="hero">
            <Store className="hero-icon" />
            <h1 style={{ color: "white" }}>Seller Dashboard</h1>
            <p>Your vehicle sales and rental performance overview</p>
          </div>

          <section
            className="profile-section"
            style={{ backgroundColor: "#1f2937" }}
          >
            <div className="profile-header">
              <img
                src={user?.profilePicture || "/default-avatar.jpg"}
                className="avatar"
                alt="User Profile"
              />
              <div className="user-info">
                <h1
                  className="user-name"
                  style={{ textAlign: "left", color: "white" }}
                >
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="user-role">{user?.role}</p>
                <div className="user-details">
                  <div className="detail-item">
                    <Mail size={18} />
                    <span>{user?.email}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={18} />
                    <span>
                      Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <button
                   style={{ backgroundColor: "transparent", color: "rgb(255,255,255)", display: "flex", alignItems: "center", width: "150px", height: "30px", border: "none", borderRadius: "10px", cursor: "pointer" }}
                    onClick={() => navigate(`/edit-seller/${id}`)}
                  >
                    <Edit style={{marginRight:"10px"}}></Edit>  Update
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="stats-grid">
            {/* Total Vehicles Sold */}
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Vehicles Sold</h3>
                <Car className="stat-icon blue-icon" />
              </div>
              <p className="stat-value">{stats.totalVehiclesSold}</p>
            </div>

            {/* Total Rentals */}
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Rentals</h3>
                <Key className="stat-icon purple-icon" />
              </div>
              <p className="stat-value">{stats.totalRentals}</p>
            </div>

            {/* Total Revenue */}
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Revenue</h3>
                <DollarSign className="stat-icon gold-icon" />
              </div>
              <p className="stat-value">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Vehicle Distribution</h3>
              <Doughnut
                data={vehicleDistributionData}
                options={{ responsive: true }}
              />
            </div>
            <br />
            <br />
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerDashBoard;