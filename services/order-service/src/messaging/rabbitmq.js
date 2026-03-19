const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const ORDER_EXCHANGE = process.env.ORDER_EVENTS_EXCHANGE || "order.events";
const ORDER_CREATED_KEY = process.env.ORDER_CREATED_ROUTING_KEY || "order.created";

let connection;
let channel;

const getChannel = async () => {
    if (channel) {
        return channel;
    }

    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(ORDER_EXCHANGE, "topic", { durable: true });

    connection.on("close", () => {
        console.warn("[OrderService] RabbitMQ connection closed");
        channel = null;
        connection = null;
    });

    connection.on("error", (error) => {
        console.error("[OrderService] RabbitMQ connection error:", error.message);
    });

    return channel;
};

const publishOrderCreated = async (payload) => {
    const ch = await getChannel();

    const published = ch.publish(
        ORDER_EXCHANGE,
        ORDER_CREATED_KEY,
        Buffer.from(JSON.stringify(payload)),
        {
            contentType: "application/json",
            persistent: true,
        }
    );

    if (!published) {
        console.warn("[OrderService] RabbitMQ publish buffer is full, message queued in memory");
    }
};

module.exports = {
    publishOrderCreated,
};
