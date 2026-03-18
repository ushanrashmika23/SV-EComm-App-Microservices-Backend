const Order = require("../models/orderModel");
const mongoose = require("mongoose");

const ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

class HttpError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const validateCreatePayload = (payload) => {
    const { userId, orderItems, shippingAddress, totalPrice } = payload;

    if (!userId || typeof userId !== "string") {
        throw new HttpError("userId is required", 400);
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
        throw new HttpError("orderItems is required and must contain at least one item", 400);
    }

    for (const item of orderItems) {
        if (!item.productId || !item.name) {
            throw new HttpError("Each order item must contain productId and name", 400);
        }
        if (typeof item.quantity !== "number" || item.quantity < 1) {
            throw new HttpError("Each order item must have quantity >= 1", 400);
        }
        if (typeof item.price !== "number" || item.price < 0) {
            throw new HttpError("Each order item must have price >= 0", 400);
        }
    }

    if (!shippingAddress || typeof shippingAddress !== "object") {
        throw new HttpError("shippingAddress is required", 400);
    }

    const { address, city, postalCode, country } = shippingAddress;
    if (!address || !city || !postalCode || !country) {
        throw new HttpError(
            "shippingAddress must include address, city, postalCode and country",
            400
        );
    }

    if (typeof totalPrice !== "number" || totalPrice < 0) {
        throw new HttpError("totalPrice is required and must be >= 0", 400);
    }
};

const createOrder = async (payload) => {
    validateCreatePayload(payload);

    const order = await Order.create(payload);
    return order;
};

const getOrdersByUser = async (userId) => {
    if (!userId) {
        throw new HttpError("userId is required", 400);
    }

    return Order.find({ userId }).sort({ createdAt: -1 });
};

const getOrderById = async (orderId) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new HttpError("Invalid order id", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new HttpError("Order not found", 404);
    }

    return order;
};

const updateOrderStatus = async (orderId, nextStatus) => {
    if (!ORDER_STATUSES.includes(nextStatus)) {
        throw new HttpError("Invalid status value", 400);
    }

    const order = await getOrderById(orderId);

    if (order.status === "CANCELLED") {
        throw new HttpError("Cancelled orders cannot be updated", 409);
    }

    if (order.status === "DELIVERED") {
        throw new HttpError("Delivered orders cannot be updated", 409);
    }

    order.status = nextStatus;

    if (nextStatus === "PAID") {
        order.isPaid = true;
        order.paidAt = order.paidAt || new Date();
    }

    await order.save();
    return order;
};

const cancelOrder = async (orderId) => {
    const order = await getOrderById(orderId);

    if (order.status === "DELIVERED") {
        throw new HttpError("Delivered orders cannot be cancelled", 409);
    }

    if (order.status === "CANCELLED") {
        return order;
    }

    order.status = "CANCELLED";
    await order.save();

    return order;
};

module.exports = {
    createOrder,
    getOrdersByUser,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
};
