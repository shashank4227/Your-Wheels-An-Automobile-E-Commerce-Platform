import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { History, Car, Key, Gift } from 'lucide-react';
import SideBar from './BuyerSideBar';
import axios from 'axios';
import './BuyerTransactions.css';

function BuyerTransaction() {
  const { id } = useParams();
  const location = useLocation();
  const activeLink = location.pathname;

  const [transactions, setTransactions] = useState([]);
  const [showSubscriptions, setShowSubscriptions] = useState(true);
  const [showPurchases, setShowPurchases] = useState(true);
  const [showRentals, setShowRentals] = useState(true);

  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/transactions/${id}`);
        console.log('Transactions:', response.data);
        
        if (Array.isArray(response.data)) {
          setTransactions(response.data);
        } else {
          console.error('Invalid transaction format:', response.data);
        }
      }catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Error loading transactions');
      }
      
    };

    fetchTransactions();
  }, [id]);

  // ✅ Filter transactions based on type
  const filteredTransactions = transactions.filter(transaction => 
    (showSubscriptions && transaction.type === 'subscription') ||
    (showPurchases && transaction.type === 'purchase') || 
    (showRentals && transaction.type === 'rental')
  );

  // ✅ Total Purchases
  const totalPurchases = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // ✅ Total Rentals
  const totalRentals = transactions
    .filter(t => t.type === 'rental')
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // ✅ Total Subscriptions
  const totalSubscriptions = transactions
    .filter(t => t.type === 'subscription')
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // ✅ Total Spending = Purchases + Rentals + Subscriptions
  const totalSpent = totalPurchases + totalRentals + totalSubscriptions;

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />
      </nav>

      <main className="main-content">
        <br /><br />
        <div className="hero">
          <History className="hero-icon" />
          <h1 style={{color:"white"}}>My Transactions</h1>
          <p>Track your purchases, rentals, earnings, and spending</p>
        </div>
        {error && (
  <div className="error-message" role="alert">
    {error}
  </div>
)}

        {/* ✅ Summary Cards */}
        <div className="summary-cards">
          {/* ✅ Total Purchases */}
          <div className="summary-card">
            <div className="summary-header">
              <h3>Total Purchases</h3>
              <Car className="summary-icon" />
            </div>
            <p className="summary-value">₹{totalPurchases.toLocaleString()}</p>
          </div>

          {/* ✅ Total Rentals */}
          <div className="summary-card">
            <div className="summary-header">
              <h3>Total Rentals</h3>
              <Gift className="summary-icon" />
            </div>
            <p className="summary-value">₹{totalRentals.toLocaleString()}</p>
          </div>

          {/* ✅ Total Subscriptions (Now Displayed) */}
          
          {/* ✅ Total Spending */}
          <div className="summary-card">
            <div className="summary-header">
              <h3>Total Spending</h3>
              <Key className="summary-icon spending-icon" />
            </div>
            <p className="summary-value negative">
              ₹{totalSpent.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ✅ Filter Buttons */}
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${showSubscriptions ? 'active' : ''}`}
            onClick={() => setShowSubscriptions(!showSubscriptions)}
          >
            Show Subscriptions
          </button>

          <button 
            className={`filter-btn ${showPurchases ? 'active' : ''}`}
            onClick={() => setShowPurchases(!showPurchases)}
          >
            Show Purchases
          </button>

          <button 
            className={`filter-btn ${showRentals ? 'active' : ''}`}
            onClick={() => setShowRentals(!showRentals)}
          >
            Show Rentals
          </button>
        </div>

        {/* ✅ Transactions List */}
        <div className="transaction-list">
          {filteredTransactions.map(transaction => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-info">
                <p className="transaction-date">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
                <p className="transaction-description">
                  {transaction.type === 'purchase' ? 'Purchase' : 
                   transaction.type === 'rental' ? 'Rental' : 
                   transaction.type === 'subscription' ? 'Subscription' : transaction.type}
                </p>
                <p className="transaction-status">
                  Status: {transaction.status || 'Unknown'}
                </p>
              </div>

              {/* ✅ Subscription, Rental, and Purchase amounts in RED */}
              <p className="transaction-amount negative">
                -₹{Math.abs(transaction.amount).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default BuyerTransaction;
