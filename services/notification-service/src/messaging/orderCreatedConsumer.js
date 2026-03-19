const amqp = require("amqplib");
const notificationService = require("../services/notificationService");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const ORDER_EXCHANGE = process.env.ORDER_EVENTS_EXCHANGE || "order.events";
const ORDER_CREATED_KEY = process.env.ORDER_CREATED_ROUTING_KEY || "order.created";
const QUEUE_NAME = process.env.NOTIFICATION_ORDER_CREATED_QUEUE || "notification.order.created";

const consumeOrderCreated = async () => {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(ORDER_EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, ORDER_EXCHANGE, ORDER_CREATED_KEY);
    await channel.prefetch(1);

    console.log(`[NotificationService] RabbitMQ consumer ready: queue=${QUEUE_NAME}`);

    await channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) {
            return;
        }

        try {
            const payload = JSON.parse(msg.content.toString());
            const order = payload.order || {};

            if (!order.userId) {
                console.warn("[NotificationService] Skipping order.created: userId missing");
                channel.ack(msg);
                return;
            }

            await notificationService.createNotificationFromScene({
                userId: String(order.userId),
                audienceType: "USER",
                scene: "ORDER_CREATED",
                channel: "IN_APP",
                metadata: {
                    orderId: String(order._id || ""),
                    totalPrice: order.totalPrice,
                    itemCount: Array.isArray(order.orderItems) ? order.orderItems.length : 0,
                },
            });

            console.log(`[NotificationService] Notification created for orderId=${order._id || "unknown"}`);
            channel.ack(msg);
        } catch (error) {
            console.error("[NotificationService] Failed processing order.created:", error.message);
            channel.ack(msg);
        }
    });

    connection.on("error", (error) => {
        console.error("[NotificationService] RabbitMQ connection error:", error.message);
    });

    connection.on("close", () => {
        console.warn("[NotificationService] RabbitMQ connection closed");
    });
};

module.exports = {
    consumeOrderCreated,
};
