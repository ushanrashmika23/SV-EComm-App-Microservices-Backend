#!/usr/bin/env node
/* eslint-disable no-console */

const assert = require("node:assert/strict");

const CONFIG = {
    authBase: process.env.AUTH_BASE_URL || "http://localhost:4001",
    productBase: process.env.PRODUCT_BASE_URL || "http://localhost:4002",
    orderBase: process.env.ORDER_BASE_URL || "http://localhost:5003",
    inventoryBase: process.env.INVENTORY_BASE_URL || "http://localhost:5004",
    notificationBase: process.env.NOTIFICATION_BASE_URL || "http://localhost:5005",
    emailBase: process.env.EMAIL_BASE_URL || "http://localhost:5006",
    gatewayBase: process.env.GATEWAY_BASE_URL || "http://localhost:5000",
    runEmailSendTests: String(process.env.RUN_EMAIL_SEND_TESTS || "false") === "true",
};

const state = {
    user: null,
    token: null,
    category: null,
    product: null,
    inventory: null,
    order: null,
    notification: null,
};

const testResults = [];
const requestLogs = [];
let currentCaseName = "UNSCOPED";
let requestCounter = 0;

const asPrintable = (value, maxLength = 1500) => {
    if (value === undefined) {
        return "<undefined>";
    }
    if (value === null) {
        return "<null>";
    }

    let text;
    if (typeof value === "string") {
        text = value;
    } else {
        text = JSON.stringify(value, null, 2);
    }

    if (!text) {
        return "<empty>";
    }

    if (text.length > maxLength) {
        return `${text.slice(0, maxLength)}\n...<truncated ${text.length - maxLength} chars>`;
    }

    return text;
};

const jsonRequest = async ({ method, url, body }) => {
    const startedAt = Date.now();
    const requestId = ++requestCounter;

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (body !== undefined) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    const text = await response.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (error) {
        data = { raw: text };
    }

    const durationMs = Date.now() - startedAt;
    const logEntry = {
        id: requestId,
        caseName: currentCaseName,
        method,
        url,
        status: response.status,
        ok: response.ok,
        durationMs,
        requestBody: body,
        responseBody: data,
    };

    requestLogs.push(logEntry);

    console.log(`\n----- Request #${requestId} -----`);
    console.log(`Case       : ${currentCaseName}`);
    console.log(`Method     : ${method}`);
    console.log(`URL        : ${url}`);
    console.log(`Duration   : ${durationMs}ms`);
    console.log(`Status     : ${response.status} (${response.ok ? "OK" : "ERROR"})`);
    console.log(`RequestBody:\n${asPrintable(body)}`);
    console.log(`Response   :\n${asPrintable(data)}`);
    console.log("------------------------");

    return {
        status: response.status,
        ok: response.ok,
        data,
        raw: text,
        durationMs,
    };
};

const ensure2xx = (res, context) => {
    assert.ok(
        res.status >= 200 && res.status < 300,
        `${context} failed with status ${res.status}: ${JSON.stringify(res.data)}`
    );
};

const runCase = async (name, fn) => {
    const startedAt = Date.now();
    currentCaseName = name;

    try {
        await fn();
        testResults.push({ name, status: "passed", durationMs: Date.now() - startedAt });
        console.log(`PASS ${name}`);
    } catch (error) {
        testResults.push({
            name,
            status: "failed",
            durationMs: Date.now() - startedAt,
            error: error.message,
        });
        console.error(`FAIL ${name}`);
        console.error(`  ${error.message}`);
    } finally {
        currentCaseName = "UNSCOPED";
    }
};

const runOptionalCase = async (name, condition, fn) => {
    if (!condition) {
        testResults.push({ name, status: "skipped", durationMs: 0, error: "Skipped by config" });
        console.log(`SKIP ${name}`);
        return;
    }

    await runCase(name, fn);
};

const createTestData = () => {
    const seed = Date.now();
    return {
        email: `autotest_${seed}@example.com`,
        password: "TestPass@123",
        name: `Auto Test ${seed}`,
        categoryName: `Category ${seed}`,
        productName: `Product ${seed}`,
        sku: `SKU-${seed}`,
    };
};

const run = async () => {
    const data = createTestData();

    console.log("Running automated endpoint checks with config:");
    console.log(JSON.stringify(CONFIG, null, 2));

    await runCase("Auth: POST /auth/register", async () => {
        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.authBase}/auth/register`,
            body: {
                email: data.email,
                password: data.password,
                name: data.name,
            },
        });

        ensure2xx(res, "Auth register");
        assert.ok(res.data && res.data.user && res.data.user.id, "Register should return user.id");
        state.user = res.data.user;
    });

    await runCase("Auth: POST /auth/login", async () => {
        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.authBase}/auth/login`,
            body: {
                email: data.email,
                password: data.password,
            },
        });

        ensure2xx(res, "Auth login");
        assert.ok(res.data && res.data.data && res.data.data.token, "Login should return token");
        state.token = res.data.data.token;
    });

    await runCase("Product: POST /categories", async () => {
        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.productBase}/categories`,
            body: {
                name: data.categoryName,
                description: "Auto-generated category for endpoint tests",
            },
        });

        ensure2xx(res, "Create category");
        assert.ok(res.data && res.data.id, "Category create should return id");
        state.category = res.data;
    });

    await runCase("Product: GET /categories (confirm inserted)", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.productBase}/categories`,
        });

        ensure2xx(res, "Get categories");
        assert.ok(Array.isArray(res.data), "Categories response should be an array");

        const found = res.data.find((item) => String(item.id) === String(state.category.id));
        assert.ok(found, "Inserted category must appear in category list");
    });

    await runCase("Product: GET /categories/:id (primary record check)", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.productBase}/categories/${state.category.id}`,
        });

        ensure2xx(res, "Get category by id");
        assert.equal(String(res.data.id), String(state.category.id));
    });

    await runCase("Product: POST /products (with existing category_id)", async () => {
        assert.ok(state.category && state.category.id, "Category primary record must exist first");

        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.productBase}/products`,
            body: {
                name: data.productName,
                description: "Auto-generated product",
                price: 49.99,
                category_id: state.category.id,
                image_url: "https://example.com/product.png",
            },
        });

        ensure2xx(res, "Create product");
        assert.ok(res.data && res.data.id, "Create product should return id");
        state.product = res.data;
    });

    await runCase("Product: GET /products (confirm inserted)", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.productBase}/products?page=1&limit=50`,
        });

        ensure2xx(res, "Get products");
        assert.ok(res.data && Array.isArray(res.data.data), "Products response should include data[]");

        const found = res.data.data.find((item) => String(item.id) === String(state.product.id));
        assert.ok(found, "Inserted product must appear in product list");
    });

    await runCase("Product: GET /products/:id (primary record check)", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.productBase}/products/${state.product.id}`,
        });

        ensure2xx(res, "Get product by id");
        assert.equal(String(res.data.id), String(state.product.id));
    });

    await runCase("Product: PUT /products/:id", async () => {
        const res = await jsonRequest({
            method: "PUT",
            url: `${CONFIG.productBase}/products/${state.product.id}`,
            body: {
                name: `${data.productName} Updated`,
                description: "Updated product data",
                price: 59.99,
                category: state.category.id,
                image_url: "https://example.com/product-updated.png",
            },
        });

        ensure2xx(res, "Update product");
    });

    await runCase("Product: GET /products/category/:categoryId", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.productBase}/products/category/${state.category.id}?page=1&limit=50`,
        });

        ensure2xx(res, "Get products by category");
        assert.ok(res.data && Array.isArray(res.data.data), "Category products response should include data[]");
    });

    await runCase("Inventory: POST /inventory (with existing productId)", async () => {
        assert.ok(state.product && state.product.id, "Product primary record must exist first");

        // Parent existence check before dependent insert.
        const productCheck = await jsonRequest({
            method: "GET",
            url: `${CONFIG.productBase}/products/${state.product.id}`,
        });
        ensure2xx(productCheck, "Parent product lookup before inventory create");

        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.inventoryBase}/inventory`,
            body: {
                productId: state.product.id,
                sku: data.sku,
                quantity: 25,
                reorderLevel: 5,
            },
        });

        ensure2xx(res, "Create inventory");
        assert.ok(res.data && res.data.data && res.data.data.product_id, "Create inventory should return product_id");
        state.inventory = res.data.data;
    });

    await runCase("Inventory: GET /inventory (confirm inserted)", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.inventoryBase}/inventory`,
        });

        ensure2xx(res, "Get inventory list");
        assert.ok(res.data && Array.isArray(res.data.data), "Inventory response should include data[]");

        const found = res.data.data.find((item) => String(item.product_id) === String(state.product.id));
        assert.ok(found, "Inserted inventory row must appear in inventory list");
    });

    await runCase("Inventory: GET /inventory/:productId", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.inventoryBase}/inventory/${state.product.id}`,
        });

        ensure2xx(res, "Get inventory by productId");
        assert.equal(String(res.data.data.product_id), String(state.product.id));
    });

    await runCase("Inventory: PUT /inventory/:productId", async () => {
        const res = await jsonRequest({
            method: "PUT",
            url: `${CONFIG.inventoryBase}/inventory/${state.product.id}`,
            body: {
                sku: `${data.sku}-UPD`,
                quantity: 30,
                reorderLevel: 7,
            },
        });

        ensure2xx(res, "Update inventory");
    });

    await runCase("Inventory: PATCH /inventory/:productId/adjust", async () => {
        const res = await jsonRequest({
            method: "PATCH",
            url: `${CONFIG.inventoryBase}/inventory/${state.product.id}/adjust`,
            body: { delta: 5 },
        });

        ensure2xx(res, "Adjust inventory");
    });

    await runCase("Inventory: PUT /inventory/:productId/reserve", async () => {
        const res = await jsonRequest({
            method: "PUT",
            url: `${CONFIG.inventoryBase}/inventory/${state.product.id}/reserve`,
            body: { quantity: 2 },
        });

        ensure2xx(res, "Reserve stock");
    });

    await runCase("Inventory: PUT /inventory/:productId/release", async () => {
        const res = await jsonRequest({
            method: "PUT",
            url: `${CONFIG.inventoryBase}/inventory/${state.product.id}/release`,
            body: { quantity: 1 },
        });

        ensure2xx(res, "Release stock");
    });

    await runCase("Inventory: PUT /inventory/:productId/deduct", async () => {
        const res = await jsonRequest({
            method: "PUT",
            url: `${CONFIG.inventoryBase}/inventory/${state.product.id}/deduct`,
            body: { quantity: 1 },
        });

        ensure2xx(res, "Deduct stock");
    });

    await runCase("Order: POST /orders", async () => {
        assert.ok(state.user && state.user.id, "User primary record must exist first");
        assert.ok(state.product && state.product.id, "Product primary record must exist first");

        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.orderBase}/orders`,
            body: {
                userId: String(state.user.id),
                orderItems: [
                    {
                        productId: String(state.product.id),
                        name: state.product.name || data.productName,
                        quantity: 1,
                        price: Number(state.product.price || 49.99),
                        image: state.product.image_url || "",
                    },
                ],
                shippingAddress: {
                    address: "123 Test Street",
                    city: "Colombo",
                    postalCode: "10000",
                    country: "Sri Lanka",
                },
                paymentMethod: "COD",
                totalPrice: Number(state.product.price || 49.99),
            },
        });

        ensure2xx(res, "Create order");
        assert.ok(res.data && res.data.data && res.data.data._id, "Create order should return _id");
        state.order = res.data.data;
    });

    await runCase("Order: GET /orders/user/:userId (confirm inserted)", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.orderBase}/orders/user/${state.user.id}`,
        });

        ensure2xx(res, "Get user orders");
        assert.ok(res.data && Array.isArray(res.data.data), "Orders response should include data[]");

        const found = res.data.data.find((item) => String(item._id) === String(state.order._id));
        assert.ok(found, "Inserted order must appear in user order list");
    });

    await runCase("Order: GET /orders/:id", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.orderBase}/orders/${state.order._id}`,
        });

        ensure2xx(res, "Get order by id");
        assert.equal(String(res.data.data._id), String(state.order._id));
    });

    await runCase("Order: PUT /orders/:id/status", async () => {
        const res = await jsonRequest({
            method: "PUT",
            url: `${CONFIG.orderBase}/orders/${state.order._id}/status`,
            body: { status: "PAID" },
        });

        ensure2xx(res, "Update order status");
    });

    await runCase("Order: PUT /orders/:id/cancel", async () => {
        const res = await jsonRequest({
            method: "PUT",
            url: `${CONFIG.orderBase}/orders/${state.order._id}/cancel`,
        });

        ensure2xx(res, "Cancel order");
    });

    await runCase("Notification: POST /notifications", async () => {
        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.notificationBase}/notifications`,
            body: {
                userId: String(state.user.id),
                audienceType: "USER",
                scene: "ORDER_CREATED",
                sourceService: "ORDER_SERVICE",
                channel: "IN_APP",
                priority: "MEDIUM",
                title: "Order received",
                message: "Your order was placed successfully.",
                metadata: {
                    orderId: String(state.order._id),
                    productId: String(state.product.id),
                },
            },
        });

        ensure2xx(res, "Create notification");
        assert.ok(res.data && res.data.data && res.data.data._id, "Create notification should return _id");
        state.notification = res.data.data;
    });

    await runCase("Notification: POST /notifications/events", async () => {
        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.notificationBase}/notifications/events`,
            body: {
                userId: String(state.user.id),
                audienceType: "USER",
                scene: "ORDER_STATUS_UPDATED",
                channel: "IN_APP",
                metadata: {
                    orderId: String(state.order._id),
                    status: "PAID",
                },
            },
        });

        ensure2xx(res, "Create scene notification");
    });

    await runCase("Notification: GET /notifications (confirm inserted)", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.notificationBase}/notifications?page=1&limit=50&userId=${state.user.id}`,
        });

        ensure2xx(res, "List notifications");
        assert.ok(res.data && Array.isArray(res.data.data), "Notifications response should include data[]");

        const found = res.data.data.find((item) => String(item._id) === String(state.notification._id));
        assert.ok(found, "Inserted notification must appear in notification list");
    });

    await runCase("Notification: GET /notifications/user/:userId", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.notificationBase}/notifications/user/${state.user.id}?page=1&limit=50`,
        });

        ensure2xx(res, "Get notifications by user");
        assert.ok(res.data && Array.isArray(res.data.data), "User notifications response should include data[]");
    });

    await runCase("Notification: GET /notifications/:id", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.notificationBase}/notifications/${state.notification._id}`,
        });

        ensure2xx(res, "Get notification by id");
        assert.equal(String(res.data.data._id), String(state.notification._id));
    });

    await runCase("Notification: PATCH /notifications/:id/read", async () => {
        const res = await jsonRequest({
            method: "PATCH",
            url: `${CONFIG.notificationBase}/notifications/${state.notification._id}/read`,
        });

        ensure2xx(res, "Mark notification as read");
    });

    await runCase("Notification: PATCH /notifications/user/:userId/read-all", async () => {
        const res = await jsonRequest({
            method: "PATCH",
            url: `${CONFIG.notificationBase}/notifications/user/${state.user.id}/read-all`,
        });

        ensure2xx(res, "Mark all user notifications as read");
    });

    await runCase("Email: GET /emails/templates", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.emailBase}/emails/templates`,
        });

        ensure2xx(res, "Get email templates");
        assert.ok(res.data && Array.isArray(res.data.data), "Email templates response should include data[]");
    });

    await runOptionalCase("Email: POST /emails/send", CONFIG.runEmailSendTests, async () => {
        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.emailBase}/emails/send`,
            body: {
                to: "customer@example.com",
                subject: "Automated API Test",
                text: "Automated endpoint test email",
            },
        });

        ensure2xx(res, "Send custom email");
    });

    await runOptionalCase("Email: POST /emails/send-template", CONFIG.runEmailSendTests, async () => {
        const res = await jsonRequest({
            method: "POST",
            url: `${CONFIG.emailBase}/emails/send-template`,
            body: {
                to: "customer@example.com",
                templateKey: "WELCOME",
                templateData: {
                    userName: data.name,
                },
            },
        });

        ensure2xx(res, "Send template email");
    });

    await runCase("Gateway: GET /health", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.gatewayBase}/health`,
        });

        ensure2xx(res, "Gateway health");
    });

    await runCase("Gateway: GET /", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.gatewayBase}/`,
        });

        ensure2xx(res, "Gateway root");
    });

    await runCase("Gateway proxy: GET /api/notifications?userId=...", async () => {
        const res = await jsonRequest({
            method: "GET",
            url: `${CONFIG.gatewayBase}/api/notifications?userId=${state.user.id}&page=1&limit=20`,
        });

        ensure2xx(res, "Gateway notifications proxy");
    });

    await runCase("Notification: DELETE /notifications/:id", async () => {
        const res = await jsonRequest({
            method: "DELETE",
            url: `${CONFIG.notificationBase}/notifications/${state.notification._id}`,
        });

        ensure2xx(res, "Delete notification");
    });

    await runCase("Product: DELETE /products/:id", async () => {
        const res = await jsonRequest({
            method: "DELETE",
            url: `${CONFIG.productBase}/products/${state.product.id}`,
        });

        ensure2xx(res, "Delete product");
    });

    await runCase("Product: DELETE /categories/:id", async () => {
        const res = await jsonRequest({
            method: "DELETE",
            url: `${CONFIG.productBase}/categories/${state.category.id}`,
        });

        assert.ok(
            res.status === 200 || res.status === 204,
            `Delete category failed with status ${res.status}: ${JSON.stringify(res.data)}`
        );
    });

    const passed = testResults.filter((t) => t.status === "passed").length;
    const failed = testResults.filter((t) => t.status === "failed").length;
    const skipped = testResults.filter((t) => t.status === "skipped").length;
    const totalRequests = requestLogs.length;
    const requestFailures = requestLogs.filter((r) => r.status >= 400).length;
    const avgRequestDuration =
        totalRequests > 0
            ? Math.round(requestLogs.reduce((sum, item) => sum + item.durationMs, 0) / totalRequests)
            : 0;

    console.log("\n===== Test Summary =====");
    console.table(testResults);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Skipped: ${skipped}`);

    console.log("\n===== Request Summary =====");
    console.table(
        requestLogs.map((r) => ({
            id: r.id,
            case: r.caseName,
            method: r.method,
            status: r.status,
            durationMs: r.durationMs,
            url: r.url,
        }))
    );
    console.log(`Total requests: ${totalRequests}`);
    console.log(`Requests with HTTP error status: ${requestFailures}`);
    console.log(`Average request duration: ${avgRequestDuration}ms`);

    if (requestFailures > 0) {
        console.log("\n===== Failed Request Details =====");
        requestLogs
            .filter((r) => r.status >= 400)
            .forEach((r) => {
                console.log(`\nRequest #${r.id} | ${r.method} ${r.url}`);
                console.log(`Case     : ${r.caseName}`);
                console.log(`Status   : ${r.status}`);
                console.log(`Duration : ${r.durationMs}ms`);
                console.log(`Request  :\n${asPrintable(r.requestBody)}`);
                console.log(`Response :\n${asPrintable(r.responseBody)}`);
            });
    }

    if (failed > 0) {
        process.exitCode = 1;
    }
};

run().catch((error) => {
    console.error("Fatal test runner error:", error);
    process.exit(1);
});
