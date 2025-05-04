import { useState, useEffect } from "react";
import "./Renting.css";
import axios from "axios"; // ✅ Import axios for backend requests
import { Link, useParams, useLocation } from "react-router-dom";
import SideBar from "./BuyerSideBar";
import { useNavigate } from "react-router-dom";
import React from "react";

function Renting() {
  const { id } = useParams(); // Get ID from URL
  const location = useLocation();

  // ✅ State Management
  const [vehicles, setVehicles] = useState([]);
  const [vehicleType, setVehicleType] = useState("all");
  const [brand, setBrand] = useState("all");
  const [priceRange, setPriceRange] = useState(100000);
  const [yearRange, setYearRange] = useState(2020);
  const [transmission, setTransmission] = useState("all");
  const [fuelType, setFuelType] = useState("all");
  const [mileageRange, setMileageRange] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [rentalDuration, setRentalDuration] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const navigate = useNavigate();
  // ✅ Active Link Tracking
  const [activeLink, setActiveLink] = useState(location.pathname);
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  // ✅ Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // ✅ Fetch vehicles from backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rent-vehicles`);
        if (Array.isArray(response.data)) {
          setVehicles(response.data);
        } else {
          console.error("API response is not an array:", response.data);
          setVehicles([]); // Fallback to an empty array
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setVehicles([]); // Fallback to an empty array
      }
    };

    fetchVehicles();
  }, []);

  // ✅ Calculate end date based on start date and duration
  const calculateEndDate = (start, duration) => {
    if (!start) return "";
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + duration);
    return endDate.toISOString().split("T")[0];
  };
  const endDate = calculateEndDate(startDate, rentalDuration);

  // ✅ Handle renting a vehicle
  const handleRent = async (vehicleId, price) => {
    navigate(`/confirm-rent/${id}`, {
      state: {
        vehicleId,
        price,
        startDate,
        endDate, // ✅ Fixed endDate calculation
      },
    });
  };

  // ✅ Filter Options
  const brands = vehicles.length > 0 ? [...new Set(vehicles.map((vehicle) => vehicle.brand))] : [];
  const colors = vehicles.length > 0 ? [...new Set(vehicles.map((vehicle) => vehicle.color))] : [];

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (vehicleType !== "all" && vehicle.type !== vehicleType) return false;
    if (brand !== "all" && vehicle.brand !== brand) return false;
    if (vehicle.price > priceRange) return false;
    if (vehicle.year < yearRange) return false;
    if (transmission !== "all" && vehicle.transmission !== transmission) return false;
    if (fuelType !== "all" && vehicle.fuelType !== fuelType) return false;
    if (vehicle.mileage > mileageRange) return false;
    if (
      searchQuery &&
      !vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    // ✅ Convert availableFrom and availableTo to Date objects for comparison
    const availableFrom = new Date(vehicle.availableFrom);
    const availableTo = new Date(vehicle.availableTo);

    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(calculateEndDate(startDate, rentalDuration));

      // ✅ Inclusive range check using getTime()
      if (start.getTime() < availableFrom.getTime() || end.getTime() > availableTo.getTime()) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />
      </nav>

      <main className="main-content">
        <div className="page-container">
          {/* ✅ Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
          </div>

          {/* ✅ Filters Section */}
          <div className="filters-container">
            {/* ✅ Vehicle Type */}
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="all">All Vehicles</option>
              <option value="car">Cars</option>
              <option value="bike">Bikes</option>
            </select>

            {/* ✅ Brand */}
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            {/* ✅ Transmission */}
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
            >
              <option value="all">All Transmissions</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>

            {/* ✅ Fuel Type */}
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
            >
              <option value="all">All Fuel Types</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <br />
            <div>
              {/* ✅ Price Range */}
              <label>Daily Rate: Up to ₹{priceRange}</label>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
            </div>
            {/* ✅ Year Range */}
            <div>
              <label>Year: {yearRange} or newer</label>
              <input
                type="range"
                min="2015"
                max="2024"
                value={yearRange}
                onChange={(e) => setYearRange(Number(e.target.value))}
              />
            </div>

            {/* ✅ Mileage */}
            <div>
              <label>Max Mileage: {mileageRange.toLocaleString()} mi</label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={mileageRange}
                onChange={(e) => setMileageRange(Number(e.target.value))}
              />
            </div>

            {/* ✅ Start Date */}
            <div>
              <label>Start Date</label>
              <br />
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            {/* ✅ End Date */}
            <div>
              <label>End Date</label>
              <br />
              <input
                type="date"
                value={calculateEndDate(startDate, rentalDuration)}
                disabled
                className="date-input"
                style={{ color: "black", backgroundColor: "white" }}
              />
            </div>
            {/* ✅ Rental Duration */}
            <div>
              <label>Rental Duration (days)</label>
              <br />
              <input
                type="number"
                min="1"
                max="30"
                style={{ width: "100px" }}
                value={rentalDuration}
                onChange={(e) => setRentalDuration(Number(e.target.value))}
                className="duration-input"
              />
            </div>
          </div>

          {/* ✅ Results Section */}
          <div className="vehicles-grid">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle._id || vehicle.id}
                className="vehicle-card"
                style={{ backgroundColor: "black" }}
              >
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                />
                <div className="vehicle-info">
                  <h3>{vehicle.name}</h3>
                  <p className="vehicle-type">{vehicle.type.toUpperCase()}</p>
                  <div className="vehicle-details">
                    <span>Year: {vehicle.year}</span>
                    <span>Mileage: {vehicle.mileage} mi</span>
                    <span>Transmission: {vehicle.transmission}</span>
                    <span>Fuel: {vehicle.fuelType}</span>
                    <span>Color: {vehicle.color}</span>
                  </div>
                  <div className="availability">
                    <p>Available From: {new Date(vehicle.availableFrom).toLocaleDateString()}</p>
                    <p>Available To: {new Date(vehicle.availableTo).toLocaleDateString()}</p>
                  </div>
                  <div className="rental-price">
                    <p className="daily-rate">₹{vehicle.price}/day</p>
                    <p className="total-price">
                      Total for {rentalDuration} days: ₹
                      {(vehicle.price * rentalDuration).toLocaleString()}
                    </p>
                    {startDate && (
                      <p className="rental-dates">
                        {startDate} to{" "}
                        {calculateEndDate(startDate, rentalDuration)}
                      </p>
                    )}
                  </div>
                  <span>Rating: {vehicle.rating}</span>
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
                  <button
                    className="rent-button"
                    disabled={
                      new Date(startDate) < new Date(vehicle.availableFrom) ||
                      new Date(startDate) > new Date(vehicle.availableTo)
                    }
                    onClick={() => handleRent(vehicle._id, vehicle.price)}
                  >
                    {!startDate ? "Select dates first" : "Rent Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Renting;