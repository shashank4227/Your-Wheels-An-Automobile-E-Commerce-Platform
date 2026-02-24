import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Home from './HomePage/Home';
import Signup from './Auth/Signup';
import Login from './Auth/Login';
import Buyer_DashBoard from './Buyer/BuyerDashBoard';
import FAQs from './HomePage/FAQs';
import { GoogleOAuthProvider } from "@react-oauth/google";
import Terms from './Auth/Terms';
import Membership from './Buyer/Membership';
import ChooseRole from './Auth/ChooseRole';
import Buying from './Buyer/Buying';
import Renting from './Buyer/Renting';
import ErrorPage from './ErrorPage';
import AdminLogin from './Admin/AdminLogin';
import Sell from './Seller/Sell';
import SellerDashBoard from './Seller/SellerDashboard';
import LoginRole from './Auth/LoginRole';
import Role from './Auth/Role';
import BuyerSignup  from './Buyer/BuyerSignup';
import BuyerLogin from './Buyer/BuyerLogin';
import SellerSignup from './Seller/SellerSignup';
import SellerLogin from './Seller/SellerLogin';
import AddToRent from './Seller/AddToRent';
import Seller_statistics from './Seller/Seller_statistics';
import SellerMembership from './Seller/SellerMembership';
import BuyerMemberPay from './Buyer/BuyerMemberPay';
import BuyerTransaction from './Buyer/BuyerTransaction';
import SellerTransaction from './Seller/SellerTransactions';
import CurrentMembership from './Buyer/CurrentMembership';
import SellerVehicleList from "./Seller/SellerVehicleList";
import SellerVehicleSalesList from './Seller/SellerVehicleSalesList';
import SellerMemberPay from './Seller/SellerMemberPay';
import CurrentSellerMembership from './Seller/CurrentSellerMembership';
import ConfirmBuy from './Buyer/ConfirmBuy';
import BoughtVehicles from './Buyer/BoughtVehicles';
import ConfirmRent from './Buyer/ConfirmRent';
import RentedVehicles from './Buyer/RentedVehicles';
import SoldVehicles from './Seller/SoldVehicles';
import VehiclesOnRent from './Seller/VehiclesOnRent';
import ProtectedSellerRoute from './Seller/ProtectedRoute';
import ProtectedBuyerRoute from './Buyer/ProtectedBuyerRoute';
import AdminDashBoard from './Admin/AdminDashBoard';
import ManageUsers from './Admin/ManageUsers'; 
import EditUser from "./Admin/EditUser";
import AdminVehicleOnSale from './Admin/AdminVehicleOnSale';
import AdminVehiclesForRent from './Admin/AdminVehiclesForRent';
import AdminSoldVehicles from './Admin/AdminSoldVehicles';
import AdminRentedVehicles from './Admin/AdminRentedVehicles';
import AdminTransactions from './Admin/AdminTransactions';    
import Rating from './Buyer/Rating';
import EditBuyer from './Buyer/EditBuyer';
import EditSeller from './Seller/EditSeller';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route
          path="/signup"
          element={
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <Signup />
            </GoogleOAuthProvider>
          }
        />
         <Route
          path="/login"
          element={
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <Login />
            </GoogleOAuthProvider>
          }
        />
        <Route path="/buyer-dashboard/:id" element={<Buyer_DashBoard />} />
        <Route path="/seller-dashboard/:id" element={<SellerDashBoard />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/buyer-membership/:id" element={<Membership />} />
        <Route path="/seller-membership/:id" element={<SellerMembership />} />
        <Route path="/current-membership/:id" element={<CurrentMembership/>} />
        <Route path="/current-seller-membership/:id" element={<CurrentSellerMembership/>} />
        <Route path="/choose-role" element={<ChooseRole />} />
        <Route path="/buying/:id" element={<ProtectedBuyerRoute requiredAccess={["buyAccess"]}><Buying /></ProtectedBuyerRoute>} />
        <Route path="/renting/:id" element={<ProtectedBuyerRoute requiredAccess={["rentAccess"]}><Renting /></ProtectedBuyerRoute>} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/sell" element={<ProtectedSellerRoute><Sell /></ProtectedSellerRoute>} />
        <Route path="/login-role" element={<LoginRole />} />
        <Route path="/role" element={<Role />} />
        <Route path="/buyer-signup" element={<BuyerSignup />} />
        <Route path="/seller-signup" element={<SellerSignup />} />
        <Route path="/buyer-login" element={<BuyerLogin />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/selling/:id" element={<ProtectedSellerRoute requiredAccess={["sellAccess"]}><Sell /></ProtectedSellerRoute>} />   
        <Route path="/add-to-rent/:id" element={<ProtectedSellerRoute requiredAccess={["rentAccess"]}><AddToRent /></ProtectedSellerRoute>} />
        <Route path="/seller_statistics" element={<Seller_statistics />} />
        <Route path="/buyer-membership-payment/:id" element={<BuyerMemberPay />} />
        <Route path="/buyer-transactions/:id" element={<BuyerTransaction />} />
        <Route path="/seller-transactions/:id" element={<SellerTransaction />} />
        <Route path="/vehicles-for-rent/:id" element={<ProtectedSellerRoute requiredAccess={["rentAccess"]}><SellerVehicleList /></ProtectedSellerRoute>} />
        <Route 
          path="/vehicles-on-rent/:id" 
          element={
            <ProtectedSellerRoute requiredAccess={["rentAccess"]}>
              <VehiclesOnRent />
            </ProtectedSellerRoute>
          } 
        />
        <Route path="/vehicles-for-sale/:id" element={<ProtectedSellerRoute requiredAccess={["sellAccess"]}><SellerVehicleSalesList /></ProtectedSellerRoute>} />
        <Route path="/sold-vehicles/:id" element={<ProtectedSellerRoute requiredAccess={["sellAccess"]}><SoldVehicles /></ProtectedSellerRoute>} />
        <Route path="/seller-membership-payment/:id" element={<SellerMemberPay />} />
        <Route path="/confirm-buy/:id" element={<ConfirmBuy />} />
        <Route path="/confirm-rent/:id" element={<ConfirmRent />} />
        <Route path="/bought-vehicles/:id" element={<ProtectedBuyerRoute requiredAccess={["buyAccess"]}><BoughtVehicles /></ProtectedBuyerRoute>} />
        <Route path="/rented-vehicles/:id" element={<ProtectedBuyerRoute requiredAccess={["rentAccess"]}><RentedVehicles /></ProtectedBuyerRoute>} />
        <Route path="/admin-dashboard/:email" element={<AdminDashBoard />} />
        <Route path="/admin-manage-users/:email" element={<ManageUsers />} /> {/* ✅ Fixed Route */}
        <Route path="/edit-user/:id" element={<EditUser/>}/>
        <Route path="/edit-buyer/:id" element={<EditBuyer/>}/>
        <Route path="/edit-seller/:id" element={<EditSeller/>}/>
        <Route path="/admin-vehicles-on-sale/:email" element={<AdminVehicleOnSale/>}/>
        <Route path="/admin-vehicles-for-rent/:email" element={<AdminVehiclesForRent/>}/>
        <Route path="/admin-sold-vehicles/:email" element={<AdminSoldVehicles/>}/>
        <Route path="/admin-rented-vehicles/:email" element={<AdminRentedVehicles
        />}/>
        <Route path="/admin-transactions/:email" element={<AdminTransactions/>}/>
        <Route path="/rating" element={<Rating/>}/>

      </Routes>
    </Router>
  )
}

export default App;
