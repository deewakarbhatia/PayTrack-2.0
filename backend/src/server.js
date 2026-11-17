
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5050;

// Connect to database before starting server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`PayTrack 2.0 server running on port ${PORT}`);
    });
};

startServer();
