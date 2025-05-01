import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { History, Car, Key, Gift } from "lucide-react";
import SideBar from "./SellerSideBar";
import axios from "axios";

function SellerTransaction() {
  const { id } = useParams();
  const location = useLocation();
  const activeLink = location.pathname;

  const [transactions, setTransactions] = useState([]);
  const [showSubscriptions, setShowSubscriptions] = useState(true);
  const [showRentals, setShowRentals] = useState(true);
  const [showPurchases, setShowPurchases] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/transactions/${id}`
        );
        console.log("Transactions:", response.data);

        if (Array.isArray(response.data)) {
          setTransactions(response.data);
        } else {
          console.error("Invalid transaction format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [id]);

  // ✅ Filter transactions based on type
  const filteredTransactions = transactions.filter(
    (transaction) =>
      (showSubscriptions && transaction.type === "subscription") ||
      (showRentals && transaction.type === "rental") ||
      (showPurchases &&transaction.type === "purchase" )
  );

  // ✅ Total Earnings (All earning transactions)
  const totalEarnings = transactions
    .filter((t) => t.type === "earning")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // ✅ Total Purchases → Buying vehicles only (exclude memberships and rentals)
  const totalPurchases = transactions
    .filter((t) => t.type === "purchase")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // ✅ Total Rentals → Only for rentals
  const totalRentals = transactions
    .filter((t) => t.type === "rental")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // ✅ Total Subscriptions → Deduct from profit calculation
  const totalSubscriptions = transactions
    .filter((t) => t.type === "subscription")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // ✅ Total Profit Calculation
  const totalProfit =
    totalEarnings + totalPurchases + totalRentals - totalSubscriptions;

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />
      </nav>

      <main className="main-content">
        <br />
        <br />
        <div className="hero">
          <History className="hero-icon" />
          <h1 style={{ color: "white" }}>My Transactions</h1>
          <p>Track your purchases, rentals, earnings, and spending</p>
        </div>

        {/* ✅ Summary Cards */}
        <div className="summary-cards">
          {/* ✅ Total Sales */}
          <div className="summary-card">
            <div className="summary-header">
              <h3>Total Sales</h3>
              <Car className="summary-icon" />
            </div>
            <p
              className={`summary-value ${
                totalPurchases > 0 ? "positive" : "negative"
              }`}
            >
              ₹{totalPurchases.toLocaleString()}
            </p>
          </div>

          {/* ✅ Total Rentals */}
          <div className="summary-card">
            <div className="summary-header">
              <h3>Total Rentals</h3>
              <Gift className="summary-icon" />
            </div>
            <p
              className={`summary-value ${
                totalRentals > 0 ? "positive" : "negative"
              }`}
            >
              ₹{totalRentals.toLocaleString()}
            </p>
          </div>

          {/* ✅ Total Profit */}
          <div className="summary-card">
            <div className="summary-header">
              <h3>Total Profit</h3>
              <Key className="summary-icon profit-icon" />
            </div>
            <p
              className={`summary-value ${
                totalProfit >= 0 ? "positive" : "negative"
              }`}
            >
              {totalProfit < 0 ? "-" : ""}₹
              {Math.abs(totalProfit).toLocaleString()}
            </p>
          </div>
        </div>

        {/* ✅ Filter Buttons */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${showSubscriptions ? "active" : ""}`}
            onClick={() => setShowSubscriptions(!showSubscriptions)}
          >
            Show Subscriptions
          </button>
          <button
            className={`filter-btn ${showPurchases ? "active" : ""}`}
            onClick={() => setShowPurchases(!showPurchases)}
          >
            Show Purchases
          </button>
          <button
            className={`filter-btn ${showRentals ? "active" : ""}`}
            onClick={() => setShowRentals(!showRentals)}
          >
            Show Rentals
          </button>
        </div>

        {/* ✅ Transactions List */}
        <div className="transaction-list">
          {filteredTransactions.map((transaction) => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-info">
                <p className="transaction-date">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
                <p className="transaction-description">
                  {transaction.type} payment
                </p>
                <p className="transaction-status">
                  Status: {transaction.status || "Unknown"}
                </p>
              </div>
              <p
                className={`transaction-amount ${
                  transaction.type === "subscription" ? "negative" : "positive"
                }`}
              >
                {transaction.type === "subscription" ? "-" : "+"}₹
                {Math.abs(transaction.amount).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default SellerTransaction;
