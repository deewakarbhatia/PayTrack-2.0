
const API_URL = import.meta.env.VITE_API_URL;

// Login and receive authentication token
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

// Fetch dashboard statistics
export const getDashboardStats = async (token) => {
    const response = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to load dashboard");
    }

    return data.dashboard;
};

// Fetch all payments
export const getPayments = async (token) => {
    const response = await fetch(`${API_URL}/api/payments`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to load payments");
    }

    return data.payments;
};

// Create a new payment
export const createPayment = async (token, paymentData) => {
    const response = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to create payment");
    }

    return data.payment;
};

export const updatePayment = async (token, paymentId, updates) => {
    const response = await fetch(
        `${API_URL}/api/payments/${paymentId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to update payment");
    }

    return data.payment;
};
// Register a new user
export const registerUser = async (name, email, password) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
};
// Delete a payment
export const deletePayment = async (token, paymentId) => {
    const response = await fetch(`${API_URL}/api/payments/${paymentId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to delete payment");
    }

    return data;
};
