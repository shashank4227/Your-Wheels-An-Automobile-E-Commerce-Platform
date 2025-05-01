const express = require("express");
const { googleLogin} = require('../controllers/Login');

const router = express.Router();

// Define routes
router.post("/google-login", googleLogin);



module.exports = router;
