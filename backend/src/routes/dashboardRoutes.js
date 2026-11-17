const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    getDashboardStats
} = require("../controllers/dashboardController");

const router = express.Router();

// Protect dashboard API
router.use(protect);

// Get dashboard statistics
router.get("/stats", getDashboardStats);

module.exports = router;