const notificationService = require("../services/notificationService");

const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    console.log(`[NotificationService] Notification created: ${notification._id}`);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const createNotificationFromScene = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotificationFromScene(req.body);
    console.log(`[NotificationService] Scene notification created: ${notification._id}`);

    res.status(201).json({
      success: true,
      message: "Scene notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const listNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.listNotifications(req.query);

    res.status(200).json({
      success: true,
      page: result.page,
      limit: result.limit,
      total: result.total,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(req.params.id);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const getNotificationsByUser = async (req, res, next) => {
  try {
    const result = await notificationService.getNotificationsByUser(
      req.params.userId,
      req.query
    );

    res.status(200).json({
      success: true,
      page: result.page,
      limit: result.limit,
      total: result.total,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsReadByUser = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsReadByUser(req.params.userId);

    res.status(200).json({
      success: true,
      message: "User notifications marked as read",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  createNotificationFromScene,
  listNotifications,
  getNotificationById,
  getNotificationsByUser,
  markAsRead,
  markAllAsReadByUser,
  deleteNotification,
};
