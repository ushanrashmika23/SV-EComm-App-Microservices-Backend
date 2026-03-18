require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { registerProxyRoutes } = require("./routes/proxyRoutes");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
	res.status(200).json({
		success: true,
		service: "api-gateway",
		message: "Gateway is healthy",
		timestamp: new Date().toISOString(),
	});
});

app.get("/", (req, res) => {
	res.status(200).json({
		success: true,
		message: "SV EComm API Gateway",
		routes: [
			"/api/auth/*",
			"/api/products/*",
			"/api/categories/*",
			"/api/orders/*",
			"/api/inventory/*",
			"/api/notifications/*",
			"/api/emails/*",
		],
	});
});

registerProxyRoutes(app);

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Gateway route not found",
	});
});

app.use((error, req, res, next) => {
	console.error("[APIGateway] Unhandled error:", error);
	res.status(error.statusCode || 500).json({
		success: false,
		message: error.message || "Internal server error",
	});
});

app.listen(PORT, () => {
	console.log(`[APIGateway] Server running on port ${PORT}`);
});
