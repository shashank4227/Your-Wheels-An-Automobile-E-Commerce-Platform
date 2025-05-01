import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import SideBar from "./BuyerSideBar";

function BoughtVehicles() {
  const { id } = useParams();
  const location = useLocation();
  const activeLink = location.pathname;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSalesVehicles = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized: Please log in again.");
          setLoading(false);
          return;
        }

        // ✅ Update API endpoint to fetch sold vehicles
        const response = await fetch(`http://localhost:3000/buy/buyer/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch sales vehicles");
        }

        setVehicles(data.vehicles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesVehicles();
  }, [id]);

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />
      </nav>

      <main className="main-content">
        <div className="sales-vehicle-list-container">
          <br /><br />
          <h1 style={{ color: "white" }}>Your Bought Vehicles</h1>
          <br /><br />
          {loading ? (
            <p className="sales-loading">Loading vehicles...</p>
          ) : error ? (
            <p className="sales-error">{error}</p>
          ) : vehicles.length === 0 ? (
            <p className="sales-loading">No vehicles sold yet.</p>
          ) : (
            <div className="sales-vehicles-grid">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="sales-vehicle-card" style={{ backgroundColor: "black" }}>
                  <div className="sales-vehicle-image-container">
                    <img
                      src={vehicle.imageUrl.startsWith("http")
                        ? vehicle.imageUrl
                        : `http://localhost:3000${vehicle.imageUrl}`}
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
                        <span className="sales-detail-value">{vehicle.year}</span>
                      </div>
                      <br />
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">Mileage:</span>
                        <span className="sales-detail-value">{vehicle.mileage} km</span>
                      </div>
                      <br />
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">Location:</span>
                        <span className="sales-detail-value">{vehicle.location}</span>
                      </div>
                      <br />
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">Contact:</span>
                        <span className="sales-detail-value">{vehicle.phoneNumber}</span>
                      </div>
                      
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">Price:</span>
                        <span className="sales-detail-value">
                          ₹{parseInt(vehicle.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="sales-detail-item">
                        <span className="sales-detail-label">Email:</span>
                        <span className="sales-detail-value">{vehicle.email}</span>
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

export default BoughtVehicles;
