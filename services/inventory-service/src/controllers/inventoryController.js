const inventoryService = require("../services/inventoryService");

const createInventory = async (req, res, next) => {
    try {
        const created = await inventoryService.createInventory(req.body);
        console.log(`[InventoryService] Inventory created for product: ${created.product_id}`);

        res.status(201).json({
            success: true,
            message: "Inventory created successfully",
            data: created,
        });
    } catch (error) {
        next(error);
    }
};

const getAllInventory = async (req, res, next) => {
    try {
        const items = await inventoryService.getAllInventory();
        res.status(200).json({
            success: true,
            count: items.length,
            data: items,
        });
    } catch (error) {
        next(error);
    }
};

const getInventoryByProductId = async (req, res, next) => {
    try {
        const item = await inventoryService.getInventoryByProductId(req.params.productId);
        res.status(200).json({
            success: true,
            data: item,
        });
    } catch (error) {
        next(error);
    }
};

const updateInventory = async (req, res, next) => {
    try {
        const updated = await inventoryService.updateInventory({
            productId: req.params.productId,
            ...req.body,
        });

        console.log(`[InventoryService] Inventory updated for product: ${updated.product_id}`);

        res.status(200).json({
            success: true,
            message: "Inventory updated successfully",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

const adjustInventory = async (req, res, next) => {
    try {
        const updated = await inventoryService.adjustInventory({
            productId: req.params.productId,
            delta: req.body.delta,
        });

        console.log(`[InventoryService] Inventory adjusted for product: ${updated.product_id}`);

        res.status(200).json({
            success: true,
            message: "Inventory adjusted successfully",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

const reserveStock = async (req, res, next) => {
    try {
        const updated = await inventoryService.reserveStock({
            productId: req.params.productId,
            quantity: req.body.quantity,
        });

        res.status(200).json({
            success: true,
            message: "Stock reserved successfully",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

const releaseStock = async (req, res, next) => {
    try {
        const updated = await inventoryService.releaseStock({
            productId: req.params.productId,
            quantity: req.body.quantity,
        });

        res.status(200).json({
            success: true,
            message: "Reserved stock released successfully",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

const deductStock = async (req, res, next) => {
    try {
        const updated = await inventoryService.deductStock({
            productId: req.params.productId,
            quantity: req.body.quantity,
        });

        res.status(200).json({
            success: true,
            message: "Stock deducted successfully",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
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
