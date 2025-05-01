import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  User,
  ShoppingCart,
  Key,
  CreditCard,
  LogOut,
  Users,
  CheckCircle,
} from "lucide-react";
import "./AdminSideBar.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function AdminSideBar({ activeLink, email }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:3000/admin/${email}`
  //       );
  //       setUser(response.data);
  //     } catch (error) {
  //       console.error("Error fetching user:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUser();
  // }, [email]);

  return (
    <ul className="nav-items">
      <Link to="/" className="back-link">
        Back to website →
      </Link>

      <Link to={`/admin-dashboard/${email}`}>
        <li
          className={
            activeLink === `/admin-dashboard/${email}` ? "active" : ""
          }
        >
          <Users size={20} />Admin Profile
        </li>
      </Link>
      <Link to={`/admin-manage-users/${email}`}>
        <li
          className={
            activeLink === `/admin-manage-users/${email}` ? "active" : ""
          }
        >
          <Users size={20} /> Manage Users
        </li>
      </Link>

    

    

      <Link to={`/admin-vehicles-on-sale/${email}`}>
        <li
          className={
            activeLink === `/admin-vehicles-on-sale/${email}` ? "active" : ""
          }
        >
          <ShoppingCart size={20} /> Vehicles on Sale
        </li>
      </Link>



      <Link to={`/admin-vehicles-for-rent/${email}`}>
        <li
          className={
            activeLink === `/admin-vehicles-for-rent/${email}` ? "active" : ""
          }
        >
          <Key size={20} /> Vehicles for Rent
        </li>
      </Link>

      <Link to={`/admin-sold-vehicles/${email}`}>
        <li
          className={
            activeLink === `/admin-sold-vehicles/${email}` ? "active" : ""
          }
        >
          <CreditCard size={20} /> Sold Vehicles
        </li>
      </Link>
      
      

      <Link to={`/admin-rented-vehicles/${email}`}>
        <li
          className={
            activeLink === `/admin-rented-vehicles/${email}` ? "active" : ""
          }
        >
          <CreditCard size={20} /> Rented Vehicles
        </li>
      </Link>



      <Link to={`/admin-transactions/${email}`}>
        <li
          className={
            activeLink === `/admin-transactions/${email}` ? "active" : ""
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
    </ul>
  );
}

export default AdminSideBar;
