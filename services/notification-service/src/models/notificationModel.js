const mongoose = require("mongoose");

const SCENES = [
  "AUTH_REGISTERED",
  "AUTH_LOGGED_IN",
  "ORDER_CREATED",
  "ORDER_STATUS_UPDATED",
  "ORDER_CANCELLED",
  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
  "PRODUCT_DELETED",
  "CATEGORY_CREATED",
  "CATEGORY_DELETED",
  "INVENTORY_CREATED",
  "INVENTORY_UPDATED",
  "INVENTORY_ADJUSTED",
  "INVENTORY_RESERVED",
  "INVENTORY_RELEASED",
  "INVENTORY_DEDUCTED",
  "SYSTEM_ALERT",
];

const CHANNELS = ["IN_APP", "EMAIL", "SMS", "PUSH"];
const DELIVERY_STATUSES = ["PENDING", "QUEUED", "SENT", "FAILED", "READ"];
const SOURCE_SERVICES = [
  "AUTH_SERVICE",
  "ORDER_SERVICE",
  "PRODUCT_SERVICE",
  "INVENTORY_SERVICE",
  "SYSTEM",
];
const AUDIENCE_TYPES = ["USER", "ADMIN", "BROADCAST"];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      trim: true,
      index: true,
    },
    audienceType: {
      type: String,
      enum: AUDIENCE_TYPES,
      default: "USER",
      index: true,
    },
    scene: {
      type: String,
      enum: SCENES,
      required: true,
      index: true,
    },
    sourceService: {
      type: String,
      enum: SOURCE_SERVICES,
      default: "SYSTEM",
      index: true,
    },
    channel: {
      type: String,
      enum: CHANNELS,
      default: "IN_APP",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    deliveryStatus: {
      type: String,
      enum: DELIVERY_STATUSES,
      default: "PENDING",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    scheduledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = {
  Notification,
  SCENES,
  CHANNELS,
  SOURCE_SERVICES,
  AUDIENCE_TYPES,
};
