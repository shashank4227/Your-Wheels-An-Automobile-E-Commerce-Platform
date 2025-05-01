import { useState, useEffect } from "react";
import "./Buying.css";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import SideBar from "./BuyerSideBar";

function Buying() {
  const { id } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [vehicleType, setVehicleType] = useState("all");
  const [brand, setBrand] = useState("all");
  const [priceRange, setPriceRange] = useState(100000000);
  const [yearRange, setYearRange] = useState(2020);
  const [transmission, setTransmission] = useState("all");
  const [fuelType, setFuelType] = useState("all");
  const [mileageRange, setMileageRange] = useState(1000);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  useEffect(() => {
    fetch("http://localhost:3000/available-vehicles")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Vehicles:", data.vehicles); // 🔍 Debugging step
        if (data.success) {
          setVehicles(data.vehicles);
        } else {
          throw new Error(data.message || "Failed to fetch vehicles");
        }
      })
      .catch((error) => console.error("Error fetching vehicles:", error));
  }, []);

  const filteredVehicles = vehicles.filter((vehicle) => {
    console.log("Checking vehicle:", vehicle); // Debugging log

    if (vehicleType !== "all" && vehicle.type !== vehicleType) return false;
    if (brand !== "all" && vehicle.brand !== brand) return false;
    if (vehicle.price > priceRange) return false;
    if (vehicle.year < yearRange) return false;
    if (transmission !== "all" && vehicle.transmission !== transmission)
      return false;
    if (fuelType !== "all" && vehicle.fuelType !== fuelType) return false;
    if (Number(vehicle.mileage) > Number(mileageRange)) return false;
    if (
      searchQuery &&
      !vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    return !vehicle.isSold; // Only show unsold vehicles
  });

  console.log("Filtered Vehicles:", filteredVehicles);

  const handleBuy = (vehicleId, price) => {
    // ✅ Navigate to confirmation page with vehicle details
    navigate(`/confirm-buy/${id}`, { state: { vehicleId, price } });
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />
      </nav>

      <main className="main-content">
        <div className="page-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
          </div>
          <div className="filters-container">
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="suv">SUV</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="scooter">Scooter</option>
            </select>

            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="all">All Brands</option>
              <option value="Toyota">Toyota</option>
              <option value="Ford">Ford</option>
              <option value="Honda">Honda</option>
              <option value="Maruthi">Maruthi</option>
            </select>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
            >
              <option value="all">All Transmissions</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
            >
              <option value="all">All Fuel Types</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="plug-in-hybrid">Plug-in Hybrid</option>
              <option value="cng">CNG</option>
            </select>
            <br />
            <input
              type="range"
              min="5000"
              max="100000000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
            />
            <span>Max Price: ₹{priceRange.toLocaleString("en-IN")}</span>

            <input
              type="range"
              min="2000"
              max="2025"
              value={yearRange}
              onChange={(e) => setYearRange(Number(e.target.value))}
            />
            <span>Year: {yearRange}</span>

            <br />

            <input
              type="range"
              min="0"
              max="100"
              value={mileageRange}
              onChange={(e) => setMileageRange(Number(e.target.value))}
            />
            <span>Max Mileage: {mileageRange.toLocaleString()} mi</span>
          </div>

          <div className="rental-container">
            <div className="vehicles-grid">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle._id} className="vehicle-card">
                  <img
                    src={`http://localhost:3000${vehicle.imageUrl}`}
                    alt={vehicle.name}
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/150")
                    }
                  />
                  <div className="vehicle-info">
                    <h3>{vehicle.name}</h3>
                    <p className="vehicle-type">{vehicle.type.toUpperCase()}</p>
                    <div className="vehicle-details">
                      <span>Year: {vehicle.year}</span>
                      <span>Mileage: {vehicle.mileage} mi</span>
                    </div>
                    <div className="vehicle-specs">
                      <span>{vehicle.transmission}</span>
                      <span>{vehicle.fuelType}</span>
                      <span>{vehicle.color}</span>
                    </div>
                    <p className="vehicle-price">
                      ₹{vehicle.price.toLocaleString("en-IN")}
                    </p>
                    {!vehicle.isSold ? (
                      <button
                        className="buy-button"
                        onClick={() => handleBuy(vehicle._id, vehicle.price)}
                      >
                        Buy Now
                      </button>
                    ) : (
                      <span className="sold-label">Sold</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Buying;
