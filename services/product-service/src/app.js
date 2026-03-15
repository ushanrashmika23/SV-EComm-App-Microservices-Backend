const express = require("express");
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");

const app = express();

app.use(express.json());
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);

module.exports = app;