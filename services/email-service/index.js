require("dotenv").config();

const app = require("./src/app");
const { verifyTransport } = require("./src/config/smtp");

const PORT = process.env.PORT || 5006;

const startServer = async () => {
  try {
    await verifyTransport();

    app.listen(PORT, () => {
      console.log(`[EmailService] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("[EmailService] Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
