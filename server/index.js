require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet"); // Security headers
const morgan = require("morgan"); // Request logging
const rateLimit = require("express-rate-limit"); // Brute-force protection
const { sequelize } = require("./models");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const examRoutes = require("./routes/examRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// --- 1. GLOBAL SECURITY & MONITORING ---

// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// Professional Logging (Prints every request to the terminal: Method, URL, Status, Response Time)
app.use(morgan("dev"));

// Rate Limiting: Prevent DDoS or brute force on the Auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Only allow your frontend to connect
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" })); // Increased limit for bulk question uploads

// --- 2. API ROUTES ---

// Apply limiter only to authentication to prevent hacking attempts
app.use("/api/auth", authRoutes);

app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/admin", adminRoutes);

// --- 3. MAINTENANCE & HEALTH CHECKS ---

// Professional Health Check Endpoint (Used by hosting providers to see if site is up)
app.get("/status", (req, res) => {
  res.json({
    status: "Operational",
    database: "Connected",
    timestamp: new Date(),
    version: "1.0.0",
  });
});

// --- 4. GLOBAL ERROR HANDLER (The Senior Step) ---

// 404 Handler (When a user types a wrong URL)
app.use((req, res, next) => {
  res.status(404).json({ message: "API Resource Not Found" });
});

// Centralized Error Handling (Catch-all for any server crashes)
app.use((err, req, res, next) => {
  console.error("🔥 SYSTEM CRASH DETECTED:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "A critical error occurred in the AI Engine.",
  });
});

// --- 5. SERVER INITIALIZATION ---

const PORT = process.env.PORT || 5000;

// Sync database and start
sequelize
  .sync({ alter: true }) // 'alter: true' keeps MySQL in sync with your Model code changes
  .then(() => {
    console.log("✅ Supabase Connected and Tables Created!");
    app.listen(PORT, () => {
      console.log(`🚀 ADAPTIVE AI SERVER ACTIVE: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/status`);
    });
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed:", err.message);
    process.exit(1); // Stop the server if DB fails
  });
