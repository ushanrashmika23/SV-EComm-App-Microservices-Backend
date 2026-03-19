const amqp = require("amqplib");
const emailService = require("../services/emailService");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const ORDER_EXCHANGE = process.env.ORDER_EVENTS_EXCHANGE || "order.events";
const ORDER_CREATED_KEY = process.env.ORDER_CREATED_ROUTING_KEY || "order.created";
const QUEUE_NAME = process.env.EMAIL_ORDER_CREATED_QUEUE || "email.order.created";

const buildEmailContent = (order) => {
    const items = Array.isArray(order.orderItems) ? order.orderItems : [];
    const lines = items.map((item) => `- ${item.name} x${item.quantity}`).join("\n");

    const text = [
        "Your order has been created successfully.",
        `Order ID: ${order._id || "N/A"}`,
        `Total: ${order.totalPrice ?? "N/A"}`,
        "",
        "Items:",
        lines || "- No items",
    ].join("\n");

    return {
        subject: `Order confirmation ${order._id || ""}`.trim(),
        text,
    };
};

const consumeOrderCreated = async () => {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(ORDER_EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, ORDER_EXCHANGE, ORDER_CREATED_KEY);
    await channel.prefetch(1);

    console.log(`[EmailService] RabbitMQ consumer ready: queue=${QUEUE_NAME}`);

    await channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) {
            return;
        }

        try {
            const payload = JSON.parse(msg.content.toString());
            const order = payload.order || {};
            const to = order.customerEmail || process.env.EMAIL_ORDER_FALLBACK_TO;

            if (!to) {
                console.warn("[EmailService] Skipping order.created email: customer email not available");
                channel.ack(msg);
                return;
            }

            const content = buildEmailContent(order);
            await emailService.sendMail({
                to,
                subject: content.subject,
                text: content.text,
            });

            console.log(`[EmailService] Order confirmation sent for orderId=${order._id || "unknown"}`);
            channel.ack(msg);
        } catch (error) {
            console.error("[EmailService] Failed processing order.created:", error.message);
            channel.ack(msg);
        }
    });

    connection.on("error", (error) => {
        console.error("[EmailService] RabbitMQ connection error:", error.message);
    });

    connection.on("close", () => {
        console.warn("[EmailService] RabbitMQ connection closed");
    });
};

module.exports = {
    consumeOrderCreated,
};
