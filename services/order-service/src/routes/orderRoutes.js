const express = require("express");
const orderController = require("../controllers/orderController");
const { authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authorizeRoles(["admin", "customer"]), orderController.createOrder);
router.get("/user/:userId", authorizeRoles(["admin", "customer"]), orderController.getOrdersByUser);
router.get("/:id", authorizeRoles(["admin", "customer"]), orderController.getOrderById);
router.put("/:id/status", authorizeRoles(["admin"]), orderController.updateOrderStatus);
router.put("/:id/cancel", authorizeRoles(["admin", "customer"]), orderController.cancelOrder);

module.exports = router;
