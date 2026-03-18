require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`[OrderService] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("[OrderService] Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
