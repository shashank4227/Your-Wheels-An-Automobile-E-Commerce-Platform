import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  User,
  ShoppingCart,
  Key,
  CreditCard,
  Star,
  LogOut,
} from "lucide-react";
import "./SellerSideBar.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
function SideBar({ activeLink, id }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Track location for active state
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/seller/${id}`);
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
      <Link to={`/seller-dashboard/${id}`}>
        <li
          className={activeLink === `/seller-dashboard/${id}` ? "active" : ""}
        >
          <User size={20} /> Profile
        </li>
      </Link>
      <Link to={`/seller-membership/${id}`}>
        <li
          className={activeLink === `/seller-membership/${id}` ? "active" : ""}
        >
          <Star size={20} /> Membership
        </li>
      </Link>

      <Link to={`/selling/${id}`}>
        <li className={activeLink === `/selling/${id}` ? "active" : ""}>
          <ShoppingCart size={20} /> Selling
        </li>
      </Link>
      {/* ✅ New Link for "Vehicles for Sale" */}
      <Link to={`/vehicles-for-sale/${id}`}>
        <li
          className={activeLink === `/vehicles-for-sale/${id}` ? "active" : ""}
        >
          <ShoppingCart size={20} /> Vehicles for Sale
        </li>
      </Link>
      <Link to={`/sold-vehicles/${id}`}>
        <li className={activeLink === `/sold-vehicles/${id}` ? "active" : ""}>
          <ShoppingCart size={20} /> Sold Vehicles
        </li>
      </Link>
      <Link to={`/add-to-rent/${id}`}>
        <li className={activeLink === `/add-to-rent/${id}` ? "active" : ""}>
          <Key size={20} /> Add to Rent
        </li>
      </Link>
      <Link to={`/vehicles-for-rent/${id}`}>
        <li
          className={activeLink === `/vehicles-for-rent/${id}` ? "active" : ""}
        >
          <Key size={20} /> Vehicles for Rent
        </li>
      </Link>
      <Link to={`/vehicles-on-rent/${id}`}>
        <li
          className={activeLink === `/vehicles-on-rent/${id}` ? "active" : ""}
        >
          <Key size={20} /> Rented Vehicles
        </li>
      </Link>
      <Link to={`/seller-transactions/${id}`}>
        <li
          className={
            activeLink === `/seller-transactions/${id}` ? "active" : ""
          }
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
      {/* <Link to={`/settings/${id}`}>
        <li className={activeLink === `/settings/${id}` ? 'active' : ''}>
          <Settings size={20} /> Settings
        </li>
      </Link> */}
    </ul>
  );
}

export default SideBar;
