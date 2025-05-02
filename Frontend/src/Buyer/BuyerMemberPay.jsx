import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./BuyerMemberPay.css";
import SideBar from "./BuyerSideBar";
import axios from "axios";

function BuyerMemberPay() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const amount = location.state?.amount || 0;
  const membershipType = location.state?.membershipType || "";
  const [billingPeriod] = useState("annually");
  const [activeLink, setActiveLink] = useState(location.pathname);

  const tax = amount * 0.1;
  const total = amount + tax;

  const [zipCode, setZipCode] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const validateInputs = () => {
    const newErrors = {};

    if (!zipCode.match(/^\d{6}$/)) {
      newErrors.zipCode = "Zip code must be 6 digits";
    }
    if (!nameOnCard.trim()) {
      newErrors.nameOnCard = "Name on card is required";
    }
    if (!cardNumber.match(/^\d{16}$/)) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    const expireDatePattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expireDate.match(expireDatePattern)) {
      newErrors.expireDate = "Expire date format should be MM/YY";
    } else {
      const [expMonth, expYear] = expireDate.split("/").map(Number);
      const current = new Date();
      const currentMonth = current.getMonth() + 1;
      const currentYear = current.getFullYear() % 100;

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expireDate = "Expiry date must be in the future";
      }
    }

    if (!cvv.match(/^\d{3}$/)) {
      newErrors.cvv = "CVV must be 3 digits";
    }

    if (!membershipType) {
      newErrors.membershipType = "Membership type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payment`, {
        userId: id,
        amount,
        billingPeriod,
        zipCode,
        nameOnCard,
        cardNumber,
        expireDate,
        cvv,
        membershipType,
      });

      setMessage("Payment successful!");
      setTimeout(() => navigate(`/buyer-membership/${id}`), 1000); // Optional delay
    } catch (error) {
      console.error("Payment Error:", error);
      setMessage(error.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={`/buyer-membership/${id}`} id={id} />
      </nav>

      <div className="membership-payment-container">
        <div className="membership-plan-details">
          <div className="membership-standard-plan">
            <h2>
              Standard
              <span className="membership-off-badge">Buyer Membership</span>
            </h2>
            <p>Enjoy buyer features like renting and buying vehicles based on the membership</p>
            <div className="membership-price">₹{amount}</div>
            <div className="membership-price-details">
              per user / per month
              <br />
              billed {billingPeriod}
            </div>
          </div>

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
            {errors.zipCode && <p className="form-error">{errors.zipCode}</p>}
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
            {errors.nameOnCard && <p className="form-error">{errors.nameOnCard}</p>}
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
            {errors.cardNumber && <p className="form-error">{errors.cardNumber}</p>}
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
              {errors.expireDate && <p className="form-error">{errors.expireDate}</p>}
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
              {errors.cvv && <p className="form-error">{errors.cvv}</p>}
            </div>
          </div>

          <button
            className="membership-pay-button"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay ₹${total.toFixed(2)} and Upgrade`}
          </button>

          {message && <p className="payment-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default BuyerMemberPay;
