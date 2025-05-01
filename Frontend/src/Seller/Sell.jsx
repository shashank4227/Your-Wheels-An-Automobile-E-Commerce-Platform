import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import SideBar from "./SellerSideBar";
import { useNavigate } from "react-router-dom";
function Sell() {
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ Extract `id` from route params
  const location = useLocation();
  const activeLink = location.pathname;

  const [formData, setFormData] = useState({
    type: "car",
    brand: "",
    name: "",
    price: "",
    year: new Date().getFullYear(),
    mileage: "",
    transmission: "automatic",
    fuelType: "petrol",
    color: "",
    totalUnits: 1,
    location: "",
    condition: "excellent",
    features: "",
    insuranceRequired: true,
    securityDeposit: "",
    description: "",
    phoneNumber: "",
    email: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const token = localStorage.getItem("token");

      console.log("Token:", token);
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image.");

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Image upload failed. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
        if (!imageUrl) {
          alert("Error uploading image. Please try again.");
          setUploading(false);
          return;
        }
      }

      // Format the data to ensure all numbers are actual Number types
      const vehicleData = {
        type: formData.type,
        brand: formData.brand,
        name: formData.name,
        price: Number(formData.price),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        color: formData.color,
        imageUrl: imageUrl,
        totalUnits: Number(formData.totalUnits),
        location: formData.location,
        condition: formData.condition,
        features: formData.features,
        securityDeposit: Number(formData.securityDeposit),
        description: formData.description,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
      };

      // Debug what's being sent
      console.log("Sending vehicle data:", vehicleData);

      const token = localStorage.getItem("token");
      console.log("Using token:", token ? "Token exists" : "No token found");

      const res = await fetch("http://localhost:3000/sellVehicles/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleData),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to add vehicle");
      }

      navigate(`/vehicles-for-sale/${id}`);
      // Reset form as you were doing before
      setFormData({
        type: "car",
        brand: "",
        name: "",
        price: "",
        // Other field resets...
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        `Error: ${error.message || "Something went wrong. Please try again."}`
      );
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="app">
      <nav className="sidebar">
        <SideBar activeLink={activeLink} id={id} />{" "}
        {/* ✅ Pass id to SideBar */}
      </nav>
      <main className="main-content">
        <div className="add-to-rent-container">
          <div className="rent-form-container">
            <h1>Add Vehicle Inventory</h1>
            <form onSubmit={handleSubmit} className="vehicle-form">
              <div className="form-group image-upload-group">
                <label htmlFor="image">Vehicle Image</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                    required
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Vehicle preview" />
                    </div>
                  )}
                  {!imagePreview && (
                    <div className="image-placeholder">
                      <span>Click to upload image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="type">Vehicle Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="totalUnits">Total Available Units</label>
                <input
                  type="number"
                  id="totalUnits"
                  name="totalUnits"
                  value={formData.totalUnits}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Tesla, BMW, Ducati"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Model Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Model S, M5, Panigale"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Vehicle Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Daily rate in USD"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="securityDeposit">Security Deposit (₹)</label>
                <input
                  type="number"
                  id="securityDeposit"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Security deposit amount"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="2000"
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mileage">Mileage</label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Current mileage"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="transmission">Transmission</label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  required
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="semi-automatic">Semi-Automatic</option>
                  <option value="cvt">CVT</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fuelType">Fuel Type</label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="plug-in-hybrid">Plug-in Hybrid</option>
                  <option value="cng">CNG</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition">Vehicle Condition</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="excellent">Excellent</option>
                  <option value="very-good">Very Good</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., Red, Blue, Black"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Vehicle pickup location"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Required for contact"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Required for contact"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="features">Features & Amenities</label>
                <textarea
                  id="features"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="List main features and amenities"
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Vehicle Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the vehicle"
                  rows="4"
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Add to Inventory"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Sell;
