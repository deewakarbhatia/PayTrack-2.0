const Payment = require("../models/Payment");

// GET DASHBOARD STATISTICS
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const payments = await Payment.find({
            user: userId
        });

        const totalPayments = payments.length;

        const totalPaid = payments
            .filter(payment => payment.status === "Paid")
            .reduce((sum, payment) => sum + payment.amount, 0);

        const totalPending = payments
            .filter(payment => payment.status === "Pending")
            .reduce((sum, payment) => sum + payment.amount, 0);

        const totalOverdue = payments
            .filter(payment => payment.status === "Overdue")
            .reduce((sum, payment) => sum + payment.amount, 0);

        const upcomingPayments = payments.filter(payment =>
            payment.status === "Pending" &&
            new Date(payment.dueDate) >= new Date()
        );

        res.status(200).json({
            success: true,
            dashboard: {
                totalPayments,
                totalPaid,
                totalPending,
                totalOverdue,
                upcomingPayments: upcomingPayments.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch dashboard statistics"
        });
    }
};

module.exports = { getDashboardStats };