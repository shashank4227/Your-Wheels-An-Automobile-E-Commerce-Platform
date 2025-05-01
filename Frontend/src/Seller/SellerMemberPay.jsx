import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import SideBar from './SellerSideBar';
import axios from 'axios';

function SellerMemberPay() {
  const { id } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();

  const amount = location.state?.amount || 0;
  const membershipType = location.state?.membershipType || '';
  const [billingPeriod, setBillingPeriod] = useState('annually');
  const [activeLink, setActiveLink] = useState(location.pathname);

  const tax = amount * 0.1;
  const total = amount + tax;

  const [zipCode, setZipCode] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  // ✅ Input Validations
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
    if (!expireDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expireDate = 'Expire date format should be MM/YY';
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
    if (!validateInputs()) {
      setMessage('Please fix the validation errors.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/seller-payment`, {
        sellerId: id,
        amount,
        billingPeriod,
        zipCode,
        nameOnCard,
        cardNumber,
        expireDate,
        cvv,
        membershipType
      });

      console.log('Payment Success:', response.data);
      setMessage('Payment successful!');

      // ✅ Redirect to dashboard after payment success
      navigate(`/seller-membership/${id}`);
    } catch (error) {
      console.error('Payment Error:', error);
      setMessage(error.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app" style={{ backgroundColor: "#141414" }}>
      {/* Sidebar */}
      <nav className="sidebar">
        <SideBar activeLink={`/seller-membership/${id}`} id={id} />
      </nav>

      {/* Payment Container */}
      <div className="membership-payment-container">
        {/* Plan Details */}
        <div className="membership-plan-details">
          <div className="membership-standard-plan">
            <h2>
              Standard
              <span className="membership-off-badge">Seller Membership</span>
            </h2>
            <p>Enjoy buyer features like renting and buying vehicles based on the membership</p>

            <div className="membership-price">₹{amount}</div>
            <div className="membership-price-details">
              per user / per month<br />billed {billingPeriod}
            </div>
          </div>

          {/* Dynamic Total Section */}
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
              value={zipCode}
              className="membership-form-input"

              onChange={(e) => setZipCode(e.target.value)}
              maxLength={6}
              placeholder="000000"
            />
            {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
          </div>

          {/* Name on Card */}
          <div className="membership-form-group">
            <label className="membership-form-label">Name on card</label>
            <input 
              type="text"
              value={nameOnCard}
              className="membership-form-input"
              onChange={(e) => setNameOnCard(e.target.value)}
              placeholder="Required"
            />
            {errors.nameOnCard && <span className="error-text">{errors.nameOnCard}</span>}
          </div>

          {/* Credit Card Number */}
          <div className="membership-form-group">
            <label className="membership-form-label">Credit card number</label>
            <input 
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="membership-form-input"
              maxLength={16}
              placeholder="0000 - 0000 - 0000 - 0000"
            />
            {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
          </div>

          {/* Expire Date and CVV */}
          <div className="membership-form-row">
            <div className="membership-form-group">
              <label className="membership-form-label">Expire date</label>
              <input 
                type="text"
                value={expireDate}
                maxLength={5}
                onChange={(e) => setExpireDate(e.target.value)}
                className="membership-form-input"
                placeholder="MM / YY"
              />
              {errors.expireDate && <span className="error-text">{errors.expireDate}</span>}
            </div>
            <div className="membership-form-group">
              <label className="membership-form-label">CVC / CVV</label>
              <input 
                type="text"
                value={cvv}
                className="membership-form-input"
                onChange={(e) => setCvv(e.target.value)}
                maxLength={3}
                placeholder="CVC"
              />
              {errors.cvv && <span className="error-text">{errors.cvv}</span>}
            </div>
          </div>

          {/* Pay Button */}
          <button 
            className="membership-pay-button"
            
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)} and Upgrade`}
          </button>

          {/* Success/Failure Message */}
          {message && <p className="payment-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default SellerMemberPay;
