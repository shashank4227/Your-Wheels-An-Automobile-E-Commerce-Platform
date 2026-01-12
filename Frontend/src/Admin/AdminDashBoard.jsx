import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./AdminDashBoard.css";
import AdminSideBar from "./AdminSideBar";
import axios from "axios";
import React from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Store,
  CheckCircle,
  Trash2,
  Mail
} from "lucide-react";
function AdminDashBoard() {
  const { email } = useParams(); // Extract email instead of id
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
       

        const usersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users`);
        setBuyers(usersResponse.data.buyers);
        setSellers(usersResponse.data.sellers);

        
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchData();
  }, [email]);

  return (
    <div className="app">
      <nav className="sidebar">
        <AdminSideBar activeLink={activeLink} email={email} />
      </nav>

      <main className="main-content">
        <div
          className="dashboard-container"
          style={{ backgroundColor: "#141414" }}
        >
          <div className="hero">
            <Store className="hero-icon" />
            <h1 style={{color: "white"}}>Admin Dashboard</h1>
            <p>Overview of platform performance</p>
          </div>
          <section
            className="profile-section"
            style={{ backgroundColor: "#1f2937" }}
          >
            <div className="profile-header">
              
              <div className="user-info">
                
                <div className="user-details">
                  <div className="detail-item">
                    <Mail size={18} />
                    <span style={{color:"white"}}><b>Admin Email:</b> {email}</span>
                  </div>
                  
                </div>
              </div>
            </div>
          </section>

          <div className="stats-grid" >
            <div className="stat-card">
              <div className="stat-header">
                <h3 style={{color:"white"}}>Total Buyers</h3>
                <Users className="stat-icon" />
              </div>
              <p className="stat-value" style={{color:"white"}}>{buyers.length}</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3 style={{color:"white"}}>Total Sellers</h3>
                <Users className="stat-icon" />
              </div>
              <p className="stat-value" style={{color:"white"}}>{sellers.length}</p>
            </div>

            
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashBoard;
