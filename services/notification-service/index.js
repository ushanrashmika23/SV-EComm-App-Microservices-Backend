require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const { consumeOrderCreated } = require("./src/messaging/orderCreatedConsumer");

const PORT = process.env.PORT || 5005;

const startServer = async () => {
  try {
    await connectDB();

    consumeOrderCreated().catch((error) => {
      console.error("[NotificationService] RabbitMQ consumer startup failed:", error.message);
    });

    app.listen(PORT, () => {
      console.log(`[NotificationService] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("[NotificationService] Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
