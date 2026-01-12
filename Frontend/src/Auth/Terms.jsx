import "./Terms.css";
import { Link } from "react-router-dom";
function Terms() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <img src="/logo.png" alt="Logo" />
          </Link>
        </div>
      </nav>
      <div style={{ backgroundColor: "black" }}>
        <div className="privacy-container">
          <Link to="/seller-signup" className="back-link">
            Back to Signup →
          </Link>
          <header className="privacy-header">
            <h1>Terms and Conditions</h1>
            <p className="last-updated">Last Updated March 10, 2025</p>
          </header>

          <div className="privacy-content">
            <main className="main-content">
              <p className="intro-text">
                These Terms and Conditions govern your use of the Your Wheels
                platform and services.
              </p>

              <h2>Terms and Conditions</h2>
              <p className="policy-text">
                Welcome to Your Wheels. By accessing or using our platform, you
                agree to comply with and be bound by these Terms and Conditions.
                If you do not agree to these terms, please do not use our
                services.
              </p>

              <h3>1. Use of Services</h3>
              <p className="policy-text">
                Your Wheels provides a platform for users to book vehicles for
                rental purposes. By using our services, you confirm that you are
                legally eligible to enter into a binding contract and that you
                will use the platform for lawful purposes only.
              </p>

              <h3>2. User Responsibilities</h3>
              <p className="policy-text">
                You agree to provide accurate information when creating an
                account and using our services. You are responsible for
                maintaining the confidentiality of your account details and for
                all activities that occur under your account.
              </p>

              <h3>3. Booking and Payments</h3>
              <p className="policy-text">
                All bookings are subject to availability and confirmation.
                Payments must be made through the approved payment methods
                provided on the platform. Your Wheels reserves the right to
                cancel bookings in case of payment failure or suspicious
                activity.
              </p>

              <h3>4. Cancellations and Refunds</h3>
              <p className="policy-text">
                Cancellation policies vary based on the type of booking. Refund
                eligibility is determined based on the cancellation policy
                applicable at the time of booking.
              </p>

              <h3>5. Changes to Terms</h3>
              <p className="policy-text">
                Your Wheels reserves the right to update or modify these Terms
                and Conditions at any time. Continued use of the platform after
                any changes indicates your acceptance of the updated terms.
              </p>
            </main>
          </div>
          <br />
          <br />
        </div>
      </div>
    </>
  );
}

export default Terms;
