import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./BuyerMemberPay.css";
import SideBar from "./BuyerSideBar";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BuyerMemberPay() {
  const { id } = useParams(); // Get ID from URL
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Receive amount and membershipType from location state
  const amount = location.state?.amount || 0;
  const membershipType = location.state?.membershipType || ""; // Define membershipType
  const [billingPeriod, setBillingPeriod] = useState("annually");
  const [activeLink, setActiveLink] = useState(location.pathname);

  // ✅ Calculate tax and total dynamically
  const tax = amount * 0.1;
  const total = amount + tax;

  // ✅ Payment state
  const [zipCode, setZipCode] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const validateInputs = () => {
    const newErrors = {};
  
    if (!zipCode.match(/^\d{6}$/)) {
      newErrors.zipCode = 'Zip code must be 6 digits';
    }
    if (!nameOnCard.trim()) {
      newErrors.nameOnCard = 'Name on card is required';
    }
    if (!cardNumber.match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
  
    const expireDatePattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expireDate.match(expireDatePattern)) {
      newErrors.expireDate = 'Expire date format should be MM/YY';
    } else {
      const [expMonth, expYear] = expireDate.split('/').map(Number);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
      const currentYear = currentDate.getFullYear() % 100; // Get last two digits of year
  
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expireDate = 'Expiry date must be current or future month/year';
      }
    }
  
    if (!cvv.match(/^\d{3}$/)) {
      newErrors.cvv = 'CVV must be 3 digits';
    }
    if (!membershipType) {
      newErrors.membershipType = 'Membership type is required';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // ✅ Handle Payment
  const handlePayment = async () => {
    if (!validateInputs()) return;

    if (!membershipType) {
      setMessage("Membership type is required!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payment`, {
        userId: id,
        amount,
        billingPeriod,
        zipCode,
        nameOnCard,
        cardNumber,
        expireDate,
        cvv,
        membershipType, // ✅ Send membershipType to backend
      });

      console.log("Payment Success:", response.data);
      setMessage("Payment successful!");

      // ✅ Redirect to dashboard after payment success
      navigate(`/buyer-membership/${id}`);
    } catch (error) {
      console.error("Payment Error:", error);
      setMessage(error.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <nav className="sidebar">
        <SideBar activeLink={`/buyer-membership/${id}`} id={id} />
      </nav>

      {/* Payment Container */}
      <div className="membership-payment-container">
        {/* Plan Details */}
        <div className="membership-plan-details">
          <div className="membership-standard-plan">
            <h2>
              Standard
              <span className="membership-off-badge">Buyer Membership</span>
            </h2>
            <p>
              Enjoy buyer features like renting and buying vehicles based on the
              membership
            </p>

            {/* ✅ Dynamic Price */}
            <div className="membership-price">₹{amount}</div>
            <div className="membership-price-details">
              per user / per month
              <br />
              billed {billingPeriod}
            </div>
          </div>

          {/* ✅ Dynamic Total Section */}
          <div className="membership-total-section">
            <div className="membership-total-row">
              <span>Subtotal</span>
              <span>₹{amount}</span>
            </div>
            <div className="membership-total-row">
              <span>Taxes and Fees</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="membership-total-row membership-final-row">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="membership-payment-form">
          <h2>Payment details</h2>

          {/* Zip Code */}
          <div className="membership-form-group">
            <label className="membership-form-label">Zip code</label>
            <input
              type="text"
              className="membership-form-input"
              placeholder="000000"
              value={zipCode}
              maxLength={6}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </div>

          {/* Name on Card */}
          <div className="membership-form-group">
            <label className="membership-form-label">Name on card</label>
            <input
              type="text"
              className="membership-form-input"
              placeholder="Required"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
            />
          </div>

          {/* Credit Card Number */}
          <div className="membership-form-group">
            <label className="membership-form-label">Credit card number</label>
            <input
              type="text"
              className="membership-form-input"
              placeholder="0000 - 0000 - 0000 - 0000"
              value={cardNumber}
              maxLength={16}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>

          {/* Expire Date and CVV */}
          <div className="membership-form-row">
            <div className="membership-form-group">
              <label className="membership-form-label">Expire date</label>
              <input
                type="text"
                className="membership-form-input"
                placeholder="MM / YY"
                maxLength={5}
                value={expireDate}
                onChange={(e) => setExpireDate(e.target.value)}
              />
            </div>
            <div className="membership-form-group">
              <label className="membership-form-label">CVC / CVV</label>
              <input
                type="text"
                className="membership-form-input"
                placeholder="CVC"
                value={cvv}
                maxLength={3}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>

          {/* Pay Button */}
          <button
            className="membership-pay-button"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay ₹${total.toFixed(2)} and Upgrade`}
          </button>

          {/* ✅ Show Success/Failure Message */}
          {message && <p className="payment-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default BuyerMemberPay;
