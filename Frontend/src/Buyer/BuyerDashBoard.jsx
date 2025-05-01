import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./DashBoard.css";
import { Mail, Calendar, IndianRupee,Edit } from "lucide-react";
import SideBar from "./BuyerSideBar";
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
import { Car, Key, DollarSign, Store } from "lucide-react";

// ✅ Register ChartJS components
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

function DashBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ State for Stats
  const [stats, setStats] = useState({
    totalVehiclesBought: 0,
    totalRentedVehicles: 0,
    totalRevenue: 0,
  });

  // ✅ Extract token and store it in localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("buyerId", id);
      console.log("Token from Google Login stored:", token);

      // ✅ Clean up the URL to remove token
      window.history.replaceState({}, document.title, `/buyer-dashboard/${id}`);
    }
  }, [id, location.search]);

  // ✅ Fetch user data with token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized: No token available");

        const response = await axios.get(`http://localhost:3000/buyer/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("User Data:", response.data);
        console.log(response.data.profilePicture);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        alert(`Failed to load user data: ${error.message}`);
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    // console.log(user.profilePicture);


    if (id) fetchUser();
  }, [id]);

  // ✅ Fetch Stats Data
  useEffect(() => {


    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/buyer-stats/${id}`
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        alert("Failed to load stats data");
      }
    };

    if (id) fetchStats();
  }, [id]);

  // ✅ Handle Logout
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("buyerId");
      navigate("/");
    }
  };

  // ✅ Update Active Link
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  // ✅ Dynamic Vehicle Distribution Data
  // const vehicleDistributionData = {
  //   labels: ["Vehicles Bought", "Vehicles Rented"],
  //   datasets: [
  //     {
  //       data: [stats.totalVehiclesBought, stats.totalRentedVehicles],
  //       backgroundColor: ["#3b82f6", "#8b5cf6"],
  //     },
  //   ],
  // };

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />
      </nav>

      <main className="main-content">
        <div className="buyer-container">
          <div className="hero">
            <Store className="hero-icon" />
            <h1 style={{ color: "white" }}>Buyer Dashboard</h1>
            <p>Your vehicle sales and rental performance overview</p>
          </div>

          <section
            className="profile-section"
            style={{ backgroundColor: "#1e2227" }}
          >
            <div className="profile-header">
              <img
                src={user.profilePicture }
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
                      Joined {new Date(user?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button style={{ backgroundColor: "transparent", color: "rgb(255,255,255)", display: "flex", alignItems: "center", width: "150px", height: "30px", border: "none", borderRadius: "10px", cursor: "pointer" }} onClick={() => navigate(`/edit-buyer/${id}`)}>
                    <Edit style={{marginRight:"10px"}}></Edit>  Update
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ✅ Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Vehicles Bought</h3>
                <Car className="stat-icon blue-icon" />
              </div>
              <p className="stat-value">{stats.totalVehiclesBought}</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Rented Vehicles</h3>
                <Key className="stat-icon purple-icon" />
              </div>
              <p className="stat-value">{stats.totalRentedVehicles}</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Money Spent</h3>
                <IndianRupee className="stat-icon gold-icon" />
              </div>
              <p className="stat-value">
                ₹{stats.totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* ✅ Charts */}
          <div className="charts-grid" style={{ width: "500px" }}>
            {/* <div className="chart-card">
              <h3>Vehicle Distribution</h3>
              <IndianRupee data={vehicleDistributionData} options={{ responsive: true }} />
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashBoard;
