const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/authRoutes");
const protectedRoutes = require("./src/routes/protectedRoutes");
const couponRoutes = require("./src/routes/couponRoutes");
// Import couponController to access validateCoupon function
const couponController = require("./src/controllers/couponController");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Basic route
app.get("/api", (req, res) => {
  res.json({ message: "Backend is running successfully" });
});

// PUBLIC COUPON VALIDATION ENDPOINT - No auth required
app.post("/api/validate-coupon/:code", couponController.validateCoupon);

// Use authRoutes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/protected", protectedRoutes);

// Protected coupon routes
app.use("/api/coupons", couponRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Server error",
    error: process.env.NODE_ENV !== "production" ? err.message : {},
  });
});

// Running server
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Public coupon validation available at: http://localhost:${PORT}/api/validate-coupon/:code`
  );
});
