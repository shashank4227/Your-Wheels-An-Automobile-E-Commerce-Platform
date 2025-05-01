import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";

function AdminVehicleOnSale() {
  const { email } = useParams();
  const location = useLocation();
  const activeLink = location.pathname;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehiclesForSale = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized: Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/admin-vehicle-on-sale`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch vehicles for sale");
        }

        setVehicles(data.vehicles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehiclesForSale();
  }, [email]);

  return (
    <div className="app">
      <nav className="sidebar">
        <AdminSideBar activeLink={activeLink} email={email} />
      </nav>
      <main className="main-content">
        <div className="sales-vehicle-list-container">
          <br />
          <br />
          <h1 style={{ color: "white" }}>Your Vehicles for Sale</h1>
          <br />
          <br />
          {loading ? (
            <p className="sales-loading">Loading vehicles...</p>
          ) : error ? (
            <p className="sales-error">{error}</p>
          ) : vehicles.length === 0 ? (
            <p className="sales-loading">No vehicles listed for sale yet.</p>
          ) : (
            <div className="sales-vehicles-grid">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="sales-vehicle-card"
                  style={{ backgroundColor: "black" }}
                >
                  <div className="sales-vehicle-image-container">
                    <img
                      src={
                        vehicle.imageUrl.startsWith("http")
                          ? vehicle.imageUrl
                          : `${import.meta.env.VITE_BACKEND_URL}/${vehicle.imageUrl}`
                      }
                      alt={vehicle.name}
                      className="sales-vehicle-image"
                      onError={(e) => (e.target.src = "/default-car.png")}
                    />
                  </div>
                  <div className="sales-vehicle-content">
                    <div className="sales-vehicle-header">
                      <h2 className="sales-vehicle-title">
                        {vehicle.brand} {vehicle.name}
                      </h2>
                      <span className="vehicle-type">{vehicle.type}</span>
                    </div>

                    <div className="sales-vehicle-details">
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">Year:</span>
                        <span className="sales-detail-value">
                          {vehicle.year}
                        </span>
                      </div>
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">Mileage:</span>
                        <span className="sales-detail-value">
                          {vehicle.mileage} km
                        </span>
                      </div>
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">Location:</span>
                        <span className="sales-detail-value">
                          {vehicle.location}
                        </span>
                      </div>
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">
                          Phone Number:
                        </span>
                        <span className="sales-detail-value">
                          {vehicle.phoneNumber}
                        </span>
                      </div>

                      <div className="sales-detail-item">
                        <span className="sales-detail-label">Deposit:</span>
                        <span className="sales-detail-value">
                          ₹{parseInt(vehicle.securityDeposit).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="sales-detail-item">
                      <span className="sales-detail-label">Email:</span>
                      <span className="sales-detail-value">
                        {vehicle.email}
                      </span>
                    </div>
                    <br />
                    <div className="sales-vehicle-tags">
                      <span className="sales-tag">{vehicle.transmission}</span>
                      <span className="sales-tag">{vehicle.fuelType}</span>
                      <span className="sales-tag">{vehicle.condition}</span>
                    </div>

                    <p className="sales-vehicle-description">
                      Description: {vehicle.description}
                    </p>
                    <p className="sales-vehicle-description">
                      Features: {vehicle.features}
                    </p>

                    <div className="sales-vehicle-price">
                      <span className="sales-price-currency">₹</span>
                      {parseInt(vehicle.price).toLocaleString()}
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

export default AdminVehicleOnSale;
