const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createPayment,
    getPayments,
    updatePayment,
    deletePayment
} = require("../controllers/paymentController");

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Create a payment
router.post("/", createPayment);

// Get all payments
router.get("/", getPayments);

// Update a payment
router.put("/:id", updatePayment);

// Delete a payment
router.delete("/:id", deletePayment);

module.exports = router;