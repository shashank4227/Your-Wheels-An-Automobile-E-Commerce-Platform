import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import SideBar from "./SellerSideBar";
import "./SellerVehicleList.css";
import React from "react";
function VehiclesOnRent() {
  const { id } = useParams();
  const location = useLocation();
  const activeLink = location.pathname;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Unauthorized: Please log in again.");
          setLoading(false);
          navigate("/seller-login");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/vehicles-on-rent/seller/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch vehicles");
        }

        setVehicles(data.vehicles);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />
      </nav>
      <main className="main-content">
        <div className="sales-vehicle-list-container">
          <br /><br />
          <h1>Your Listed Vehicles</h1>
          <br /><br />
          {loading ? (
            <p className="loading">Loading vehicles...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : vehicles.length === 0 ? (
            <p className="loading">No vehicles listed for rent yet.</p>
          ) : (
            <div className="sales-vehicles-grid">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="sales-vehicle-card" style={{ backgroundColor: "black" }}>
                  <img 
                    src={vehicle.imageUrl}

                    alt={vehicle.name} 
                    className="vehicle-image"
                  />
                  <div className="vehicle-content">
                    <h2>{vehicle.brand} {vehicle.name}</h2>
                    <span className="vehicle-type">{vehicle.type}</span>
                    
                    <div className="vehicle-details">
                      <div className="detail-item">
                        <span className="detail-label">Rented By</span>
                        <span className="detail-value">
                          {vehicle.buyer ? `${vehicle.buyer.firstName} ${vehicle.buyer.lastName}` : "N/A"}
                        </span>
                      </div>
                      <br />
                      {/* comment */}
                      <div className="detail-item">
                        <span className="detail-label">Buyer Email</span>
                        <span className="detail-value">
                          {vehicle.buyer ? `${vehicle.buyer.email}` : "N/A"}
                        </span>
                      </div>
                      <br />
                      <div className="detail-item">
                        <span className="detail-label">Year</span>
                        <span className="detail-value">{vehicle.year}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Mileage</span>
                        <span className="detail-value">{vehicle.mileage} km</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Transmission</span>
                        <span className="detail-value">{vehicle.transmission}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Fuel Type</span>
                        <span className="detail-value">{vehicle.fuelType}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Rent Hours</span>
                        <span className="detail-value">{vehicle.rentHours}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Color</span>
                        <span className="detail-value">{vehicle.color}</span>
                      </div>
                    </div>

                    <div className="vehicle-price">
                      <span>₹{parseInt(vehicle.price).toLocaleString()}</span>
                      <span className="price-period">/ day</span>
                    </div>

                    <div className="vehicle-dates">
                      <strong>Rental duration:</strong>
                      {new Date(vehicle.rentedFrom).toLocaleDateString('en-GB')} to {new Date(vehicle.rentedTo).toLocaleDateString('en-GB')}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default VehiclesOnRent;
