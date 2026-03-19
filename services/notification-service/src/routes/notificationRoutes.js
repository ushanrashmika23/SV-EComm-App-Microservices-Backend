const express = require("express");
const notificationController = require("../controllers/notificationController");
const { authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authorizeRoles(["admin", "customer"]), notificationController.createNotification);
router.post("/events", authorizeRoles(["admin", "customer"]), notificationController.createNotificationFromScene);
router.get("/", authorizeRoles(["admin", "customer"]), notificationController.listNotifications);
router.get("/user/:userId", authorizeRoles(["admin", "customer"]), notificationController.getNotificationsByUser);
router.get("/:id", authorizeRoles(["admin", "customer"]), notificationController.getNotificationById);
router.patch("/:id/read", authorizeRoles(["admin", "customer"]), notificationController.markAsRead);
router.patch("/user/:userId/read-all", authorizeRoles(["admin", "customer"]), notificationController.markAllAsReadByUser);
router.delete("/:id", authorizeRoles(["admin", "customer"]), notificationController.deleteNotification);

module.exports = router;
