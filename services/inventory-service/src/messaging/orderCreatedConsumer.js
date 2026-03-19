const amqp = require("amqplib");
const inventoryService = require("../services/inventoryService");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const ORDER_EXCHANGE = process.env.ORDER_EVENTS_EXCHANGE || "order.events";
const ORDER_CREATED_KEY = process.env.ORDER_CREATED_ROUTING_KEY || "order.created";
const QUEUE_NAME = process.env.INVENTORY_ORDER_CREATED_QUEUE || "inventory.order.created";

const consumeOrderCreated = async () => {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(ORDER_EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, ORDER_EXCHANGE, ORDER_CREATED_KEY);
    await channel.prefetch(1);

    console.log(`[InventoryService] RabbitMQ consumer ready: queue=${QUEUE_NAME}`);

    await channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) {
            return;
        }

        try {
            const payload = JSON.parse(msg.content.toString());
            const order = payload.order || {};
            const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];

            for (const item of orderItems) {
                const quantity = Number(item.quantity);
                if (!item.productId || !Number.isInteger(quantity) || quantity <= 0) {
                    continue;
                }

                await inventoryService.adjustInventory({
                    productId: String(item.productId),
                    delta: -quantity,
                });
            }

            console.log(`[InventoryService] Processed order.created for orderId=${order._id || "unknown"}`);
            channel.ack(msg);
        } catch (error) {
            console.error("[InventoryService] Failed processing order.created:", error.message);
            channel.ack(msg);
        }
    });

    connection.on("error", (error) => {
        console.error("[InventoryService] RabbitMQ connection error:", error.message);
    });

    connection.on("close", () => {
        console.warn("[InventoryService] RabbitMQ connection closed");
    });
};

module.exports = {
    consumeOrderCreated,
};
