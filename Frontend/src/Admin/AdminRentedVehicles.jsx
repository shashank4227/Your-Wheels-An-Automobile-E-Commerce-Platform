import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";

function AdminRentedVehicles() {
  const { email } = useParams();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rent/admin`, {
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
  }, [email]);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  return (
    <div className="app">
      <nav className="sidebar">
        <AdminSideBar activeLink={activeLink} email={email} />
      </nav>

      <main className="main-content">
        <div className="sales-vehicle-list-container">
          <br /><br />
          <h1 style={{ color: "white" }}>Your Rented Vehicles</h1>
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
      {/* ✅ Vehicle Image */}
      <div className="sales-vehicle-image-container">
        <img
          src={vehicle.imageUrl.startsWith("http")
            ? vehicle.imageUrl
            : `${import.meta.env.VITE_BACKEND_URL}/${vehicle.imageUrl}`}
          alt={vehicle.name}
          className="sales-vehicle-image"
          onError={(e) => (e.target.src = "/default-car.png")}
        />
      </div>

      {/* ✅ Vehicle Content */}
      <div className="sales-vehicle-content">
        {/* ✅ Header */}
        <div className="sales-vehicle-header">
          <h2 className="sales-vehicle-title">
            {vehicle.brand} {vehicle.name}
          </h2>
          <span className="vehicle-type">{vehicle.type}</span>
        </div>
        <div className="sales-vehicle-tags">
                      <span className="sales-tag">{vehicle.transmission}</span>
                      <span className="sales-tag">{vehicle.fuelType}</span>
                    </div>

        {/* ✅ Vehicle Details */}
        <div className="sales-vehicle-details">
          <div className="sales-detail-item">
            <span className="sales-detail-label">Year:</span>
            <span className="sales-detail-value">{vehicle.year}</span>
          </div>
          <div className="sales-detail-item">
            <span className="sales-detail-label">Mileage:</span>
            <span className="sales-detail-value">{vehicle.mileage} km</span>
          </div>
          {/* <div className="sales-detail-item">
            <span className="sales-detail-label">Transmission:</span>
            <span className="sales-detail-value">{vehicle.transmission}</span>
          </div> */}
          {/* <div className="sales-detail-item">
            <span className="sales-detail-label">Fuel Type:</span>
            <span className="sales-detail-value">{vehicle.fuelType}</span>
          </div> */}
          <div className="sales-detail-item">
            <span className="sales-detail-label">Color:</span>
            <span className="sales-detail-value">{vehicle.color}</span>
          </div>
          <div className="sales-detail-item">
            <span className="sales-detail-label">Available From:</span>
            <span className="sales-detail-value">
              {new Date(vehicle.availableFrom).toLocaleDateString()}
            </span>
          </div>
          <div className="sales-detail-item">
            <span className="sales-detail-label">Available To:</span>
            <span className="sales-detail-value">
              {new Date(vehicle.availableTo).toLocaleDateString()}
            </span>
          </div>
          <div className="sales-detail-item">
            <span className="sales-detail-label">Rented From:</span>
            <span className="sales-detail-value">
              {new Date(vehicle.rentedFrom).toLocaleDateString()}
            </span>
          </div>
          <div className="sales-detail-item">
            <span className="sales-detail-label">Rented To:</span>
            <span className="sales-detail-value">
              {new Date(vehicle.rentedTo).toLocaleDateString()}
            </span>
          </div>
          <div className="sales-detail-item">
            <span className="sales-detail-label">Rent Hours:</span>
            <span className="sales-detail-value">{vehicle.rentHours} hrs</span>
          </div>
          {/* <div className="sales-detail-item">
            <span className="sales-detail-label">Rating:</span>
            <span className="sales-detail-value">{vehicle.rating || "Not rated"}</span>
          </div> */}
          <div className="sales-detail-item">
            <span className="sales-detail-label">Price:</span>
            <span className="sales-detail-value">
              ₹{parseInt(vehicle.price).toLocaleString("en-IN")}
            </span>
          </div>
          {/* <div className="sales-detail-item">
            <span className="sales-detail-label">Location:</span>
            <span className="sales-detail-value">{vehicle.location || "Unknown"}</span>
          </div> */}
          <div className="sales-detail-item">
            <span className="sales-detail-label">Contact:</span>
            <span className="sales-detail-value">{vehicle.phoneNumber}</span>
          </div>
          <div className="sales-detail-item">
            <span className="sales-detail-label">Email:</span>
            <span className="sales-detail-value">{vehicle.email}</span>
          </div>
        </div>

        {/* {vehicle.features && vehicle.features.length > 0 ? (
          <div className="sales-vehicle-tags">
            {vehicle.features.map((feature, index) => (
              <span key={index} className="sales-tag">
                {feature}
              </span>
            ))}
          </div>
        ) : (
          <p className="sales-vehicle-description">No features available</p>
        )} */}

       
        {/* ✅ Reviews */}
        {/* {vehicle.reviews && vehicle.reviews.length > 0 ? (
          <div className="sales-vehicle-reviews">
            <h3>Reviews:</h3>
            {vehicle.reviews.map((review, index) => (
              <p key={index} className="sales-vehicle-review">
                {review}
              </p>
            ))}
          </div>
        ) : (
          <p className="sales-vehicle-description">No reviews yet</p>
        )} */}
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

export default AdminRentedVehicles;
