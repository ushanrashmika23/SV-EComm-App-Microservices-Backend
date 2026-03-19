const express = require("express");
const cors = require("cors");
const emailRoutes = require("./routes/emailRoutes");
const { parseForwardedAuth } = require("./middlewares/forwardedAuth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(parseForwardedAuth);

app.use((req, res, next) => {
  console.log(`[EmailService] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "email-service",
    message: "Service is healthy",
  });
});

app.use("/emails", emailRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  if (statusCode >= 500) {
    console.error("[EmailService] Internal error:", error);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;
