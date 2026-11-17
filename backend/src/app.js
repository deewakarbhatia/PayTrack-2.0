const client = require("prom-client");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const testRoutes = require("./routes/testRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");


// Create Express application
const app = express();
// Prometheus metrics configuration
const register = new client.Registry();

client.collectDefaultMetrics({ register });

// HTTP request counter
const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [register]
});

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
    buckets: [0.1, 0.5, 1, 2, 5]
});

// Collect HTTP request metrics
app.use((req, res, next) => {
    const start = process.hrtime();

    res.on("finish", () => {
        const duration = process.hrtime(start);
        const seconds = duration[0] + duration[1] / 1e9;

        const route = req.route?.path || req.path;

        httpRequestCounter.inc({
            method: req.method,
            route,
            status_code: res.statusCode
        });

        httpRequestDuration.observe({
            method: req.method,
            route,
            status_code: res.statusCode
        }, seconds);
    });

    next();
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

// Security middleware
app.use(helmet());

// Allow frontend-backend communication
app.use(cors());

// Parse incoming JSON requests
app.use(express.json({ limit: "10kb" }));

// API rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);


// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PayTrack 2.0 backend is running",
        status: "healthy"
    });
});

// Export application
module.exports = app;
