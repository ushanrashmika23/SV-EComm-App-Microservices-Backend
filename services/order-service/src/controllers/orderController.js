const orderService = require("../services/orderService");
const { publishOrderCreated } = require("../messaging/rabbitmq");

const createOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.body);
        console.log(`[OrderService] Order created: ${order._id}`);

        const orderData = order.toObject ? order.toObject() : order;
        const customerEmail = req.body.customerEmail || req.body.email || req.body.shippingAddress?.email || null;

        try {
            await publishOrderCreated({
                eventType: "order.created",
                occurredAt: new Date().toISOString(),
                order: {
                    ...orderData,
                    customerEmail,
                },
            });
            console.log(`[OrderService] Event published: order.created (${order._id})`);
        } catch (publishError) {
            console.error(`[OrderService] Failed to publish order.created for ${order._id}:`, publishError.message);
        }

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    } catch (error) {
        return next(error);
    }
};

const getOrdersByUser = async (req, res, next) => {
    try {
        const userId = req.auth?.userId || req.params.userId;
        const orders = await orderService.getOrdersByUser(userId);

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        return next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        return next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "status is required",
            });
        }

        const updatedOrder = await orderService.updateOrderStatus(id, status);
        console.log(`[OrderService] Order status updated: ${updatedOrder._id} -> ${status}`);

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder,
        });
    } catch (error) {
        return next(error);
    }
};

const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cancelledOrder = await orderService.cancelOrder(id);
        console.log(`[OrderService] Order cancelled: ${cancelledOrder._id}`);

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: cancelledOrder,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createOrder,
    getOrdersByUser,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
};
