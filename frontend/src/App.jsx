
import { useEffect, useState } from "react";
import "./App.css";
import {
  loginUser,
  registerUser,
  getDashboardStats,
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
} from "./api";

function App() {
  const [token, setToken] = useState("");
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration states
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Payment form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Utilities",
    amount: "",
    currency: "INR",
    dueDate: "",
    paymentMethod: "UPI",
  });

  // Filter payments by title and status
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Load dashboard statistics and payments
  const loadDashboard = async (authToken) => {
    const [dashboardData, paymentData] = await Promise.all([
      getDashboardStats(authToken),
      getPayments(authToken),
    ]);

    setStats(dashboardData);
    setPayments(paymentData);
  };

  // Load dashboard when token changes
  useEffect(() => {
    if (!token) return;

    loadDashboard(token).catch((err) => setError(err.message));
  }, [token]);

  // Handle login
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser(email, password);

      setToken(result.token);
      await loadDashboard(result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await registerUser(name, email, password);

      setError("");
      setShowRegister(false);
      setName("");
      setEmail("");
      setPassword("");

      alert(
        result.message || "Account created successfully! Please sign in."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a payment
  const handleAddPayment = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const paymentData = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingPaymentId) {
        await updatePayment(token, editingPaymentId, paymentData);
        setEditingPaymentId(null);
      } else {
        await createPayment(token, paymentData);
      }

      await loadDashboard(token);

      setForm({
        title: "",
        description: "",
        category: "Utilities",
        amount: "",
        currency: "INR",
        dueDate: "",
        paymentMethod: "UPI",
      });

      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark payment as paid
  // Mark payment as paid
  const handleMarkPaid = async (paymentId) => {
    setLoading(true);
    setError("");

    try {
      await updatePayment(token, paymentId, {
        status: "Paid",
        paidAt: new Date().toISOString(),
      });

      await loadDashboard(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentId) => {
    // Edit payment
    const handleEditPayment = (payment) => {
      setEditingPaymentId(payment._id);

      setForm({
        title: payment.title,
        description: payment.description || "",
        category: payment.category || "Utilities",
        amount: payment.amount,
        currency: payment.currency || "INR",
        dueDate: payment.dueDate
          ? new Date(payment.dueDate).toISOString().split("T")[0]
          : "",
        paymentMethod: payment.paymentMethod || "UPI",
      });

      setShowForm(true);
    };
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) return;

    try {
      await deletePayment(token, paymentId);
      await loadDashboard(token);
    } catch (err) {
      setError(err.message);
    }
  };

  // Login and registration page
  if (!token) {
    return (
      <div className="login-page">
        <form
          className="login-card"
          onSubmit={showRegister ? handleRegister : handleLogin}
        >
          <h1>
            PayTrack <span>2.0</span>
          </h1>

          <p>
            {showRegister
              ? "Create your account"
              : "Sign in to manage your payments"}
          </p>

          {showRegister && (
            <>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </>
          )}

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            minLength={8}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : showRegister
                ? "Create Account"
                : "Sign In"}
          </button>

          <p className="auth-toggle">
            {showRegister
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setShowRegister(!showRegister);
                setError("");
              }}
            >
              {showRegister ? "Sign In" : "Create Account"}
            </button>
          </p>
        </form>
      </div>
    );
  }

  // Dashboard loading state
  if (!stats) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  // Main dashboard
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>
          PayTrack <span>2.0</span>
        </h2>

        <p className="menu-label">MENU</p>

        <div className="menu-item active">▦ Dashboard</div>
        <div className="menu-item">↗ Payments</div>
        <div className="menu-item">◷ Reminders</div>

        <div className="sidebar-bottom">
          Smart Payment Management
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Your live payment overview</p>
          </div>

          <button
            className="add-button"
            onClick={() => {
              setToken("");
              setStats(null);
              setPayments([]);
              setError("");
            }}
          >
            Sign Out
          </button>
        </header>

        {/* Dashboard statistics */}
        <section className="stats">
          <div className="stat-card">
            <p>Total Payments</p>
            <h2>{stats.totalPayments}</h2>
            <small>Recorded transactions</small>
          </div>

          <div className="stat-card">
            <p>Total Paid</p>
            <h2 className="green">
              ₹{stats.totalPaid.toLocaleString("en-IN")}
            </h2>
            <small>Successfully completed</small>
          </div>

          <div className="stat-card">
            <p>Total Pending</p>
            <h2 className="orange">
              ₹{stats.totalPending.toLocaleString("en-IN")}
            </h2>
            <small>Awaiting payment</small>
          </div>

          <div className="stat-card">
            <p>Total Overdue</p>
            <h2 className="red">
              ₹{stats.totalOverdue.toLocaleString("en-IN")}
            </h2>
            <small>Past due payments</small>
          </div>
        </section>

        {/* Payments section */}
        <section className="payments-section">
          <div className="section-heading">
            <div>
              <h2>All Payments</h2>
              <p>Your recorded payments from MongoDB</p>
            </div>

            <button
              className="add-button"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Close Form" : "+ Add Payment"}
            </button>
          </div>

          {/* Add payment form */}
          {showForm && (
            <form
              className="payment-form"
              onSubmit={handleAddPayment}
            >
              <h3>{editingPaymentId ? "Edit Payment" : "New Payment"}</h3>

              <label>Payment Title</label>
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="e.g. Electricity Bill"
              />

              <label>Description</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Payment details"
              />

              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option>Utilities</option>
                <option>Housing</option>
                <option>Internet</option>
                <option>Education</option>
                <option>Shopping</option>
                <option>Other</option>
              </select>

              <label>Amount (₹)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                placeholder="Enter amount"
              />

              <label>Due Date</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
              />

              <label>Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentMethod: e.target.value,
                  })
                }
              >
                <option>UPI</option>
                <option>Card</option>
                <option>Net Banking</option>
                <option>Cash</option>
              </select>

              {error && <p className="error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingPaymentId
                    ? "Update Payment"
                    : "Save Payment"}
              </button>
            </form>
          )}

          {/* Search and status filters */}
          <div className="payment-filters">
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Payments table */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>PAYMENT</th>
                  <th>CATEGORY</th>
                  <th>DUE DATE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.title}</td>
                    <td>{payment.category}</td>
                    <td>
                      {new Date(payment.dueDate).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>
                    <td>
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span
                        className={`status ${payment.status.toLowerCase()}`}
                      >
                        {payment.status}
                      </span>

                      {payment.status === "Pending" && (
                        <button
                          className="paid-button"
                          onClick={() => handleMarkPaid(payment._id)}
                          disabled={loading}
                        >
                          Mark as Paid
                        </button>
                      )}
                      <button
                        className="edit-button"
                        onClick={() => handleEditPayment(payment)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeletePayment(payment._id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      No matching payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
