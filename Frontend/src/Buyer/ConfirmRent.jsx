import React, { useState, useEffect, use } from "react";
import "./ConfirmBuy.css";
import { Phone, Mail, Car, CheckCircle } from "lucide-react";
import SideBar from "./BuyerSideBar";
import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
function ConfirmRent() {
  const { id } = useParams();
  const location = useLocation();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [vehicleData, setVehicleData] = useState(null);
const navigate = useNavigate();
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  // ✅ Extract vehicleId and price from location.state
  const { vehicleId, price,startDate,endDate } = location.state || {};

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/rent/${vehicleId}`, {
          method: 'GET', // ✅ GET Method
          headers: {
            'Accept': 'application/json', // ✅ Expect JSON response
            'Authorization': `Bearer ${localStorage.getItem("token")}`, // ✅ Add token if required
          },
        });
  
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json();
  
        if (data.success) {
          setVehicleData(data.vehicle);
        } else {
          throw new Error(data.message || "Failed to fetch vehicle details");
        }
      } catch (error) {
        console.error("Error fetching vehicle details:", error);
      }
    };
  
    if (vehicleId) {
      fetchVehicleDetails(); // ✅ Trigger GET request when vehicleId changes
    }
  }, [vehicleId]);
  

  const handleConfirmPurchase = async () => {
    if (!vehicleData) return;
  
    // ✅ Debugging: Log values before sending request
    console.log("Sending data:", {
      buyerId: id,
      seller: vehicleData.seller,
      vehicleId: vehicleData._id,
      amount: price,
      rentedFrom: startDate,
      rentedTo: endDate,
    });
  
    try {
      const response = await fetch("http://localhost:3000/create-rent-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerId: id,
          seller: vehicleData.seller, 
          vehicleId: vehicleData._id,
          amount: price,
          rentedFrom: startDate,
          rentedTo: endDate,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        setIsConfirmed(true);
        navigate(`/rented-vehicles/${id}`);
      } else {
        alert("Purchase failed: " + data.message);
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to complete purchase.");
    }
  };
  
  return (
    <>
      <div className="app">
        <nav className="sidebar">
          <SideBar activeLink={activeLink} id={id} />
        </nav>
        <main className="main-content">
          <div className="purchase-container">
            <div className="purchase-card">
              <h1>Purchase Confirmation</h1>

              {vehicleData ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {/* ✅ Vehicle Details */}
                                  <div className="vehicle-details" style={{display:"flex", flexDirection:"column",backgroundColor:"#f8f9fa",padding:"20px",borderRadius:"10px"}}>
                                      
                                      <h2>Vehicle Details</h2>
                                      <div>
                                      <div className="detail-row">
                      <span className="label">Make:</span>
                      <span className="value" style={{color:"black"}}>{vehicleData.brand}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Model:</span>
                      <span className="value" style={{color:"black"}}>{vehicleData.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Year:</span>
                      <span className="value" style={{color:"black"}}>{vehicleData.year}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Price:</span>
                      <span className="value" style={{color:"black"}}>
                        ₹{price?.toLocaleString("en-IN")}
                      </span>
                    </div>
                                      </div>
                   
                  </div>

                  <div
                    style={{
                      width: "100px",
                      height: "100%",
                      backgroundColor: "#ccc",
                    }}
                  ></div>

                  {/* ✅ Seller Details */}
                  <div className="seller-details">
                    <h2>Seller Information</h2>
                    
                    <div className="contact-info">
                      <div className="contact-row">
                        <Phone className="icon" />
                        <span style={{color:"black"}}>
                          {vehicleData.phoneNumber || "Not Available"}
                        </span>
                      </div>
                      <div className="contact-row">
                        <Mail className="icon" />
                        <span style={{color:"black"}}>
                          {vehicleData.email || "Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading vehicle details...</p>
              )}

              {/* ✅ Confirmation Section */}
              {!isConfirmed ? (
                <div className="confirmation-section">
                  <p className="disclaimer">
                    By clicking confirm, you agree to proceed with the purchase
                    of this vehicle. The seller will be notified and will
                    contact you shortly.
                  </p>
                  <button
                    className="confirm-button"
                    onClick={handleConfirmPurchase}
                  >
                    Confirm Purchase
                  </button>
                </div>
              ) : (
                <div className="success-message">
                  <CheckCircle className="success-icon" />
                  <h3>Purchase Confirmed!</h3>
                  <p>The seller has been notified and will contact you soon.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default ConfirmRent;
