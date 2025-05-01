import { useState } from 'react';
import './AddToRent.css';
import { useParams, useLocation, useAsyncValue } from 'react-router-dom';
import SideBar from './SellerSideBar';
import { useNavigate } from 'react-router-dom';
function AddToRent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const activeLink = location.pathname;

  const initialFormData = {
    type: "car",
    brand: "",
    name: "",
    price: "",
    year: new Date().getFullYear(),
    mileage: "",
    transmission: "automatic",
    fuelType: "petrol",
    color: "",
    availableFrom: "",
    availableTo: "",
    rentHours: "",
    phoneNumber:"",
    email:"",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
  
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("Unauthorized: Please log in again.");
      setUploading(false);
      return;
    }
  
    if (!imageFile) {
      alert("Please upload an image.");
      setUploading(false);
      return;
    }
  
    try {
      // ✅ Step 1: Upload Image
      const formDataImage = new FormData();
      formDataImage.append("file", imageFile);
  
      const imageUploadResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataImage,
      });
  
      if (!imageUploadResponse.ok) {
        throw new Error(`Image upload failed: ${imageUploadResponse.statusText}`);
      }
  
      const imageData = await imageUploadResponse.json();
      if (!imageData.imageUrl) {
        throw new Error("Image upload failed: No image URL returned.");
      }
  
      const imageUrl = imageData.imageUrl;
  
      // ✅ Step 2: Upload Vehicle Data
      const vehicleData = { ...formData, imageUrl,rentHours: parseInt(formData.rentHours) };
  
      const vehicleResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/vehicles/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleData),
      });
  
      // ✅ Move JSON Parsing after Checking Response Status
      if (!vehicleResponse.ok) {
        const errorData = await vehicleResponse.json(); // Parse JSON only when needed
        throw new Error(errorData.message || "Vehicle listing failed");
      }
  
      const data = await vehicleResponse.json();
      
      setFormData(initialFormData);
      setImageFile(null);
      setImagePreview(null);
      navigate(`/vehicles-for-rent/${id}`);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Error submitting form. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className='app'>
      <nav className='sidebar'>
        <SideBar activeLink={activeLink} id={id} />
      </nav>
      <main className='main-content'>
        <div className='add-to-rent-container'>
          <div className='rent-form-container'>
            <h1>List Your Vehicle for Rent</h1>
            <form onSubmit={handleSubmit} className='vehicle-form'>
              <div className='form-group image-upload-group'>
                <label htmlFor='image'>Vehicle Image</label>
                <div className='image-upload-container'>
                  <input
                    type='file'
                    id='image'
                    name='image'
                    accept='image/*'
                    onChange={handleImageChange}
                    className='image-input'
                    required
                  />
                  {imagePreview && (
                    <div className='image-preview'>
                      <img src={imagePreview} alt='Vehicle preview' />
                    </div>
                  )}
                  {!imagePreview && (
                    <div className='image-placeholder'>
                      <span>Click to upload image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='form-group'>
                <label htmlFor='type'>Vehicle Type</label>
                <select id='type' name='type' value={formData.type} onChange={handleInputChange} required>
                  <option value='car'>Car</option>
                  <option value='bike'>Bike</option>
                  <option value='suv'>SUV</option>
                  <option value='truck'>Truck</option>
                  <option value='van'>Van</option>
                  <option value='scooter'>Scooter</option>
                </select>
              </div>

              <div className='form-group'>
                <label htmlFor='brand'>Brand</label>
                <input type='text' id='brand' name='brand' value={formData.brand} onChange={handleInputChange} required />
              </div>

              <div className='form-group'>
                <label htmlFor='name'>Model Name</label>
                <input type='text' id='name' name='name' value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className='form-group'>
                <label htmlFor='price'>Daily Rental Rate (₹)</label>
                <input type='number' id='price' name='price' value={formData.price} onChange={handleInputChange} required />
              </div>

              <div className='form-group'>
                <label htmlFor='year'>Year</label>
                <input type='number' id='year' name='year' value={formData.year} onChange={handleInputChange} min='2000' max={new Date().getFullYear()} required />
              </div>

              <div className='form-group'>
                <label htmlFor='mileage'>Mileage</label>
                <input type='number' id='mileage' name='mileage' value={formData.mileage} onChange={handleInputChange} min='0'max={100} required />
              </div>

              <div className='form-group'>
                <label htmlFor='transmission'>Transmission</label>
                <select id='transmission' name='transmission' value={formData.transmission} onChange={handleInputChange} required>
                  <option value='automatic'>Automatic</option>
                  <option value='manual'>Manual</option>
                  <option value='semi-automatic'>Semi-Automatic</option>
                  <option value='cvt'>CVT</option>
                </select>
              </div>

              <div className='form-group'>
                <label htmlFor='fuelType'>Fuel Type</label>
                <select id='fuelType' name='fuelType' value={formData.fuelType} onChange={handleInputChange} required>
                  <option value='petrol'>Petrol</option>
                  <option value='diesel'>Diesel</option>
                  <option value='electric'>Electric</option>
                  <option value='hybrid'>Hybrid</option>
                  <option value='plug-in-hybrid'>Plug-in Hybrid</option>
                  <option value='cng'>CNG</option>
                </select>
              </div>

              <div className='form-group'>
                <label htmlFor='color'>Color</label>
                <input type='text' id='color' name='color' value={formData.color} onChange={handleInputChange} required />
              </div>

              <div className='form-group'>
                <label htmlFor='availableFrom'>Available From</label>
                <input type='date' id='availableFrom' name='availableFrom' value={formData.availableFrom} onChange={handleInputChange} min={today} required />
              </div>

              <div className='form-group'>
                <label htmlFor='availableTo'>Available Until</label>
                <input type='date' id='availableTo' name='availableTo' value={formData.availableTo} onChange={handleInputChange} min={formData.availableFrom || today} required />
              </div>

              <div className='form-group'>
                <label htmlFor='rentHours'>Rent for How Many Hours?</label>
                <input
                  type='number'
                  id='rentHours'
                  name='rentHours'
                  value={formData.rentHours}
                  onChange={handleInputChange}
                  min='1'
                  max={24}
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

              <button type='submit' className='submit-button' disabled={uploading}>
                {uploading ? 'Uploading...' : 'List Vehicle for Rent'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddToRent;
