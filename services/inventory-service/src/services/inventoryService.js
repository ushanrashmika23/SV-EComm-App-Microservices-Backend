const { v4: uuidv4 } = require("uuid");
const inventoryModel = require("../models/inventoryModel");
const HttpError = require("../utils/httpError");

const validateNonNegativeInt = (value, fieldName) => {
    if (!Number.isInteger(value) || value < 0) {
        throw new HttpError(`${fieldName} must be a non-negative integer`, 400);
    }
};

const validatePositiveInt = (value, fieldName) => {
    if (!Number.isInteger(value) || value <= 0) {
        throw new HttpError(`${fieldName} must be a positive integer`, 400);
    }
};

const createInventory = async ({ productId, sku, quantity = 0, reorderLevel = 5 }) => {
    if (!productId || typeof productId !== "string") {
        throw new HttpError("productId is required", 400);
    }

    validateNonNegativeInt(quantity, "quantity");
    validateNonNegativeInt(reorderLevel, "reorderLevel");

    const existing = await inventoryModel.getInventoryByProductId(productId);
    if (existing) {
        throw new HttpError("Inventory for productId already exists", 409);
    }

    return inventoryModel.createInventory({
        id: uuidv4(),
        productId,
        sku,
        quantity,
        reorderLevel,
    });
};

const getAllInventory = async () => {
    return inventoryModel.getAllInventory();
};

const getInventoryByProductId = async (productId) => {
    if (!productId || typeof productId !== "string") {
        throw new HttpError("productId is required", 400);
    }

    const inventory = await inventoryModel.getInventoryByProductId(productId);
    if (!inventory) {
        throw new HttpError("Inventory not found", 404);
    }

    return inventory;
};

const updateInventory = async ({ productId, sku, quantity, reorderLevel }) => {
    if (!productId || typeof productId !== "string") {
        throw new HttpError("productId is required", 400);
    }

    validateNonNegativeInt(quantity, "quantity");
    validateNonNegativeInt(reorderLevel, "reorderLevel");

    const updated = await inventoryModel.updateInventory({
        productId,
        sku,
        quantity,
        reorderLevel,
    });

    if (!updated) {
        throw new HttpError("Inventory not found", 404);
    }

    if (updated.quantity < updated.reserved_quantity) {
        throw new HttpError("quantity cannot be lower than reserved_quantity", 409);
    }

    return updated;
};

const adjustInventory = async ({ productId, delta }) => {
    if (!productId || typeof productId !== "string") {
        throw new HttpError("productId is required", 400);
    }

    if (!Number.isInteger(delta) || delta === 0) {
        throw new HttpError("delta must be a non-zero integer", 400);
    }

    const updated = await inventoryModel.adjustInventory({ productId, delta });
    if (!updated) {
        throw new HttpError(
            "Inventory not found or adjustment would break stock constraints",
            409
        );
    }

    return updated;
};

const reserveStock = async ({ productId, quantity }) => {
    if (!productId || typeof productId !== "string") {
        throw new HttpError("productId is required", 400);
    }

    validatePositiveInt(quantity, "quantity");

    const updated = await inventoryModel.reserveStock({ productId, quantity });
    if (!updated) {
        throw new HttpError("Insufficient available stock or inventory not found", 409);
    }

    return updated;
};

const releaseStock = async ({ productId, quantity }) => {
    if (!productId || typeof productId !== "string") {
        throw new HttpError("productId is required", 400);
    }

    validatePositiveInt(quantity, "quantity");

    const updated = await inventoryModel.releaseStock({ productId, quantity });
    if (!updated) {
        throw new HttpError("Cannot release more than reserved stock", 409);
    }

    return updated;
};

const deductStock = async ({ productId, quantity }) => {
    if (!productId || typeof productId !== "string") {
        throw new HttpError("productId is required", 400);
    }

    validatePositiveInt(quantity, "quantity");

    const updated = await inventoryModel.deductStock({ productId, quantity });
    if (!updated) {
        throw new HttpError("Cannot deduct stock; reserve first and ensure enough quantity", 409);
    }

    return updated;
};

module.exports = {
    createInventory,
    getAllInventory,
    getInventoryByProductId,
    updateInventory,
    adjustInventory,
    reserveStock,
    releaseStock,
    deductStock,
};
