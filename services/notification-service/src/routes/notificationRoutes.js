const express = require("express");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.post("/", notificationController.createNotification);
router.post("/events", notificationController.createNotificationFromScene);
router.get("/", notificationController.listNotifications);
router.get("/user/:userId", notificationController.getNotificationsByUser);
router.get("/:id", notificationController.getNotificationById);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/user/:userId/read-all", notificationController.markAllAsReadByUser);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
