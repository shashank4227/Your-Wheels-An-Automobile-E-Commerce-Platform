import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import SideBar from "./BuyerSideBar";
import { useNavigate } from "react-router-dom";
function RentedVehicles() {
  const { id } = useParams();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    console.log("Fetched ID from URL:", id);
  }, [id]);
  const navigate = useNavigate();
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
        const response = await fetch(`http://localhost:3000/rent/buyer/${id}`, {
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

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />
      </nav>

      <main className="main-content">
        <div className="sales-vehicle-list-container">
          <br />
          <br />
          <h1 style={{ color: "white" }}>Your Rented Vehicles</h1>
          <br />
          <br />
          {loading ? (
            <p className="sales-loading">Loading vehicles...</p>
          ) : error ? (
            <p className="sales-error">{error}</p>
          ) : vehicles.length === 0 ? (
            <p className="sales-loading">No vehicles sold yet.</p>
          ) : (
            <div className="sales-vehicles-grid">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="sales-vehicle-card"
                  style={{ backgroundColor: "black" }}
                >
                  {/* ✅ Vehicle Image */}
                  <div className="sales-vehicle-image-container">
                    <img
                      src={
                        vehicle.imageUrl.startsWith("http")
                          ? vehicle.imageUrl
                          : `http://localhost:3000${vehicle.imageUrl}`
                      }
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
                        <span className="sales-detail-value">
                          {vehicle.color}
                        </span>
                      </div>
                      <br />
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">
                          Available From:
                        </span>
                        <span className="sales-detail-value">
                          {new Date(vehicle.availableFrom).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">
                          Available To:
                        </span>
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
                        <span className="sales-detail-value">
                          {vehicle.rentHours} hrs
                        </span>
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
                        <span className="sales-detail-value">
                          {vehicle.phoneNumber}
                        </span>
                      </div>
                      <br />
                      <div className="sales-detail-item">
                        <span className="sales-detail-label">Email:</span>
                        <span className="sales-detail-value">
                          {vehicle.email}
                        </span>
                      </div>
                      <br />
                      <button
                        style={{height: "40px", width: "100px", borderRadius: "5px",border:"2px solid ",cursor:"pointer",backgroundColor:"black",color:"white"}}
                        onClick={() => {
                          if (!vehicle._id || !id) {
                            console.error(
                              "Missing vehicleId or userId",
                              vehicle._id,
                              id
                            );
                            return alert("Vehicle ID or User ID is missing.");
                          }
                          navigate(`/rating?vehicleId=${vehicle._id}&id=${id}`);
                        }}
                      >
                        Rate
                      </button>
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
                  <span>Rating: { vehicle.rating}</span>

                    {vehicle.reviews && vehicle.reviews.length > 0 ? (
                      <div className="sales-vehicle-reviews">
                        <h3>Reviews:</h3>
                        <br />
                        {vehicle.reviews.map((review, index) => (
                          <div key={index} className="sales-vehicle-review">
                            <p>
                              <strong>Buyer:</strong> {review.firstName}
                            </p>
                            <p>
                              <strong>Comment:</strong> {review.comment}
                            </p>
                            <p>
                              <strong>Rating:</strong> ⭐ {review.rating} / 5
                            </p>
                            <p>
                              <strong>Reviewed on:</strong>{" "}
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                            <br />
                          </div>
                          
                        ))}
                      </div>
                    ) : (
                      <p className="sales-vehicle-description">
                        No reviews yet
                      </p>
                    )}
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

export default RentedVehicles;
