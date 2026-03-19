const express = require("express");
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");
const { parseForwardedAuth } = require("./middlewares/forwardedAuth");

const app = express();

app.use(express.json());
app.use(parseForwardedAuth);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);

module.exports = app;