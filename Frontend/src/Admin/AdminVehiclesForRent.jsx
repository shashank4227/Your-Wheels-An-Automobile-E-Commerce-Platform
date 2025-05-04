import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";
import React from "react";

function AdminVehicleForRent() {
  const { email } = useParams();
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

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/vehicles/admin`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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
        <AdminSideBar activeLink={activeLink} email={email} />
      </nav>
      <main className="main-content">
        <div className="sales-vehicle-list-container">
          <br />
          <br />
          <h1>Your Listed Vehicles</h1>
          <br />
          <br />
          {loading ? (
            <p className="loading">Loading vehicles...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : vehicles.length === 0 ? (
            <p className="loading">No vehicles listed for rent yet.</p>
          ) : (
            <div className="sales-vehicles-grid">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="sales-vehicle-card"
                  style={{ backgroundColor: "black" }}
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/${vehicle.imageUrl}`}
                    alt={vehicle.name}
                    className="vehicle-image"
                  />
                  <div className="vehicle-content">
                    <h2>
                      {vehicle.brand} {vehicle.name}
                    </h2>
                    <span className="vehicle-type">{vehicle.type}</span>

                    <div className="vehicle-details">
                      <div className="detail-item">
                        <span className="detail-label">
                          Seller Phone Number
                        </span>
                        <span className="detail-value">
                          {vehicle.phoneNumber}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Seller Email</span>
                        <span className="detail-value">{vehicle.email}</span>
                      </div>

                    

                      <div className="detail-item">
                        <span className="detail-label">Year</span>
                        <span className="detail-value">{vehicle.year}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Mileage</span>
                        <span className="detail-value">
                          {vehicle.mileage} km
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Transmission</span>
                        <span className="detail-value">
                          {vehicle.transmission}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Fuel Type</span>
                        <span className="detail-value">{vehicle.fuelType}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Rent Hours</span>
                        <span className="detail-value">
                          {vehicle.rentHours}
                        </span>
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
                      <strong>Available:</strong>
                      {new Date(vehicle.availableFrom).toLocaleDateString(
                        "en-GB"
                      )}{" "}
                      to{" "}
                      {new Date(vehicle.availableTo).toLocaleDateString(
                        "en-GB"
                      )}
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

export default AdminVehicleForRent;
