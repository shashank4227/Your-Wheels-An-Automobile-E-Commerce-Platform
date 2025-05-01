const express = require("express");
const { adminLogin,getVehiclesOnSale,getAdminVehiclesForRent,getAdminSoldVehicles,getAdminRentedVehicles } = require("../controllers/Admin");
const { set } = require("mongoose");

const router = express.Router();

router.post("/admin-login", adminLogin);
router.get(
  "/admin-vehicle-on-sale", getVehiclesOnSale
);
router.get(
  "/vehicles/admin", getAdminVehiclesForRent
);
router.get(
  "/sold/admin", getAdminSoldVehicles
);

router.get(
  "/rent/admin", getAdminRentedVehicles
);


module.exports = router;
