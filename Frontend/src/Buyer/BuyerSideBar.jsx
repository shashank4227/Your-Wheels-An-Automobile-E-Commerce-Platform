import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  BarChart2,
  ShoppingCart,
  Key,
  CreditCard,
  Mail,
  HelpCircle,
  Settings,
  Star,
  LogOut,
} from "lucide-react";
import "./BuyerSideBar.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
function SideBar({ activeLink, id }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Track location for active state
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/buyer/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);
  return (
    <ul className="nav-items">
      <Link to="/" className="back-link">
        Back to website →
      </Link>
      <Link to={`/buyer-dashboard/${id}`}>
        <li className={activeLink === `/buyer-dashboard/${id}` ? "active" : ""}>
          <User size={20} /> Profile
        </li>
      </Link>
      <Link to={`/buyer-membership/${id}`}>
        <li
          className={activeLink === `/buyer-membership/${id}` ? "active" : ""}
        >
          <Star size={20} /> Membership
        </li>
      </Link>

      <Link to={`/buying/${id}`}>
        <li className={activeLink === `/buying/${id}` ? "active" : ""}>
          <ShoppingCart size={20} /> Buying
        </li>
      </Link>
      <Link to={`/bought-vehicles/${id}`}>
        <li className={activeLink === `/bought-vehicles/${id}` ? "active" : ""}>
          <ShoppingCart size={20} /> Bought Vehicles
        </li>
      </Link>
      <Link to={`/renting/${id}`}>
        <li className={activeLink === `/renting/${id}` ? "active" : ""}>
          <Key size={20} /> Renting
        </li>
      </Link>
      <Link to={`/rented-vehicles/${id}`}>
        <li className={activeLink === `/rented-vehicles/${id}` ? "active" : ""}>
          <Key size={20} /> Rented Vehicles
        </li>
      </Link>
      <Link to={`/buyer-transactions/${id}`}>
        <li
          className={activeLink === `/buyer-transactions/${id}` ? "active" : ""}
        >
          <CreditCard size={20} /> Transactions
        </li>
      </Link>
      <Link to={`/`} style={{ color: "red", textAlign: "center" }}>
        <li
          onClick={() => {
            localStorage.removeItem("token");
          }}
        >
          <LogOut size={20} /> Logout
        </li>
      </Link>
      {/* <Link to={`/messages/${id}`}>
        <li className={activeLink === `/messages/${id}` ? 'active' : ''}>
          <Mail size={20} /> Messages
        </li>
      </Link> */}
      {/* <Link to={`/help/${id}`}>
        <li className={activeLink === `/help/${id}` ? 'active' : ''}>
          <HelpCircle size={20} /> Help Request
        </li>
      </Link> */}
    </ul>
  );
}

export default SideBar;
