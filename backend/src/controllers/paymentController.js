const Payment = require("../models/Payment");

// CREATE PAYMENT
const createPayment = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            amount,
            currency,
            dueDate,
            paymentMethod
        } = req.body;

        if (!title || !amount || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Title, amount and due date are required"
            });
        }

        const payment = await Payment.create({
            user: req.user.id,
            title,
            description,
            category,
            amount,
            currency,
            dueDate,
            paymentMethod
        });

        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create payment"
        });
    }
};

// GET ALL PAYMENTS
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            user: req.user.id
        }).sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch payments"
        });
    }
};

// UPDATE PAYMENT
const updatePayment = async (req, res) => {
    try {
        const payment = await Payment.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment updated successfully",
            payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to update payment"
        });
    }
};

// DELETE PAYMENT
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to delete payment"
        });
    }
};

module.exports = {
    createPayment,
    getPayments,
    updatePayment,
    deletePayment
};