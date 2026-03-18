const mongoose = require("mongoose");
const {
  Notification,
  SCENES,
  CHANNELS,
  SOURCE_SERVICES,
  AUDIENCE_TYPES,
} = require("../models/notificationModel");
const HttpError = require("../utils/httpError");

const SCENE_DEFAULTS = {
  AUTH_REGISTERED: {
    title: "Welcome to our store",
    message: "Your account was created successfully.",
    sourceService: "AUTH_SERVICE",
  },
  AUTH_LOGGED_IN: {
    title: "New login detected",
    message: "Your account has a successful login.",
    sourceService: "AUTH_SERVICE",
  },
  ORDER_CREATED: {
    title: "Order placed",
    message: "Your order has been created and is being processed.",
    sourceService: "ORDER_SERVICE",
  },
  ORDER_STATUS_UPDATED: {
    title: "Order status updated",
    message: "Your order status has changed.",
    sourceService: "ORDER_SERVICE",
  },
  ORDER_CANCELLED: {
    title: "Order cancelled",
    message: "Your order has been cancelled.",
    sourceService: "ORDER_SERVICE",
  },
  PRODUCT_CREATED: {
    title: "New product available",
    message: "A new product is now available in the store.",
    sourceService: "PRODUCT_SERVICE",
  },
  PRODUCT_UPDATED: {
    title: "Product updated",
    message: "A product was updated.",
    sourceService: "PRODUCT_SERVICE",
  },
  PRODUCT_DELETED: {
    title: "Product removed",
    message: "A product was removed from the catalog.",
    sourceService: "PRODUCT_SERVICE",
  },
  CATEGORY_CREATED: {
    title: "New category available",
    message: "A new product category was added.",
    sourceService: "PRODUCT_SERVICE",
  },
  CATEGORY_DELETED: {
    title: "Category removed",
    message: "A product category was removed.",
    sourceService: "PRODUCT_SERVICE",
  },
  INVENTORY_CREATED: {
    title: "Inventory initialized",
    message: "Inventory has been created for a product.",
    sourceService: "INVENTORY_SERVICE",
  },
  INVENTORY_UPDATED: {
    title: "Inventory updated",
    message: "Inventory values were updated.",
    sourceService: "INVENTORY_SERVICE",
  },
  INVENTORY_ADJUSTED: {
    title: "Inventory adjusted",
    message: "Inventory quantity has been adjusted.",
    sourceService: "INVENTORY_SERVICE",
  },
  INVENTORY_RESERVED: {
    title: "Stock reserved",
    message: "Stock was reserved for pending checkout.",
    sourceService: "INVENTORY_SERVICE",
  },
  INVENTORY_RELEASED: {
    title: "Reserved stock released",
    message: "Reserved stock has been released back to inventory.",
    sourceService: "INVENTORY_SERVICE",
  },
  INVENTORY_DEDUCTED: {
    title: "Stock deducted",
    message: "Reserved stock has been deducted after purchase.",
    sourceService: "INVENTORY_SERVICE",
  },
  SYSTEM_ALERT: {
    title: "System alert",
    message: "An important system event occurred.",
    sourceService: "SYSTEM",
  },
};

const parsePagination = (page = 1, limit = 20) => {
  const safePage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit =
    Number.isInteger(Number(limit)) && Number(limit) > 0 && Number(limit) <= 100
      ? Number(limit)
      : 20;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const ensureObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError("Invalid notification id", 400);
  }
};

const validateCreatePayload = (payload) => {
  const {
    userId,
    audienceType = "USER",
    scene,
    channel = "IN_APP",
    sourceService = "SYSTEM",
    title,
    message,
  } = payload;

  if (!SCENES.includes(scene)) {
    throw new HttpError("Invalid scene", 400);
  }

  if (!AUDIENCE_TYPES.includes(audienceType)) {
    throw new HttpError("Invalid audienceType", 400);
  }

  if (audienceType === "USER" && (!userId || typeof userId !== "string")) {
    throw new HttpError("userId is required when audienceType is USER", 400);
  }

  if (!CHANNELS.includes(channel)) {
    throw new HttpError("Invalid channel", 400);
  }

  if (!SOURCE_SERVICES.includes(sourceService)) {
    throw new HttpError("Invalid sourceService", 400);
  }

  if (!title || !message) {
    throw new HttpError("title and message are required", 400);
  }
};

const createNotification = async (payload) => {
  validateCreatePayload(payload);

  const notificationData = { ...payload };

  if (notificationData.channel === "EMAIL") {
    notificationData.deliveryStatus = "QUEUED";
  } else if (!notificationData.deliveryStatus) {
    notificationData.deliveryStatus = "SENT";
  }

  // Email delivery will be handled by a dedicated email service integration later.
  const notification = await Notification.create(notificationData);
  return notification;
};

const createNotificationFromScene = async (payload) => {
  const {
    scene,
    userId,
    audienceType = "USER",
    channel = "IN_APP",
    metadata = {},
    priority = "MEDIUM",
    title,
    message,
  } = payload;

  if (!SCENES.includes(scene)) {
    throw new HttpError("Invalid scene", 400);
  }

  if (!AUDIENCE_TYPES.includes(audienceType)) {
    throw new HttpError("Invalid audienceType", 400);
  }

  if (audienceType === "USER" && (!userId || typeof userId !== "string")) {
    throw new HttpError("userId is required when audienceType is USER", 400);
  }

  if (!CHANNELS.includes(channel)) {
    throw new HttpError("Invalid channel", 400);
  }

  const defaults = SCENE_DEFAULTS[scene];
  const notification = await createNotification({
    userId,
    audienceType,
    scene,
    sourceService: defaults.sourceService,
    channel,
    priority,
    title: title || defaults.title,
    message: message || defaults.message,
    metadata,
  });

  return notification;
};

const listNotifications = async (query) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const filter = {};
  if (query.userId) {
    filter.userId = query.userId;
  }
  if (query.scene) {
    filter.scene = query.scene;
  }
  if (query.channel) {
    filter.channel = query.channel;
  }
  if (query.audienceType) {
    filter.audienceType = query.audienceType;
  }
  if (query.deliveryStatus) {
    filter.deliveryStatus = query.deliveryStatus;
  }
  if (query.isRead === "true") {
    filter.isRead = true;
  }
  if (query.isRead === "false") {
    filter.isRead = false;
  }

  const [data, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return {
    page,
    limit,
    total,
    data,
  };
};

const getNotificationById = async (id) => {
  ensureObjectId(id);

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new HttpError("Notification not found", 404);
  }

  return notification;
};

const getNotificationsByUser = async (userId, query) => {
  if (!userId) {
    throw new HttpError("userId is required", 400);
  }

  return listNotifications({ ...query, userId });
};

const markAsRead = async (id) => {
  ensureObjectId(id);

  const notification = await Notification.findByIdAndUpdate(
    id,
    {
      isRead: true,
      readAt: new Date(),
      deliveryStatus: "READ",
    },
    { new: true }
  );

  if (!notification) {
    throw new HttpError("Notification not found", 404);
  }

  return notification;
};

const markAllAsReadByUser = async (userId) => {
  if (!userId) {
    throw new HttpError("userId is required", 400);
  }

  const result = await Notification.updateMany(
    { userId, isRead: false },
    {
      isRead: true,
      readAt: new Date(),
      deliveryStatus: "READ",
    }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

const deleteNotification = async (id) => {
  ensureObjectId(id);

  const deleted = await Notification.findByIdAndDelete(id);
  if (!deleted) {
    throw new HttpError("Notification not found", 404);
  }

  return deleted;
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
  SCENE_DEFAULTS,
};
