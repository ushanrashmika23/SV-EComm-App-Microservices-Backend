const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

module.exports = app;