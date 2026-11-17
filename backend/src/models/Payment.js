
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        category: {
            type: String,
            default: "Other"
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01
        },

        currency: {
            type: String,
            enum: ["INR", "USD"],
            default: "INR"
        },

        dueDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "Paid", "Overdue"],
            default: "Pending"
        },

        paymentMethod: {
            type: String,
            enum: ["UPI", "Card", "Net Banking", "Cash"],
            default: "UPI"
        },

        transactionId: {
            type: String,
            trim: true
        },

        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
