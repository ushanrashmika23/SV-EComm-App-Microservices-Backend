require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/db");
const { consumeOrderCreated } = require("./src/messaging/orderCreatedConsumer");

const PORT = process.env.PORT || 5004;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("[InventoryService] PostgreSQL connection established");

    consumeOrderCreated().catch((error) => {
      console.error("[InventoryService] RabbitMQ consumer startup failed:", error.message);
    });

    app.listen(PORT, () => {
      console.log(`[InventoryService] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("[InventoryService] Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
