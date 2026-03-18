const express = require("express");
const inventoryController = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", inventoryController.createInventory);
router.get("/", inventoryController.getAllInventory);
router.get("/:productId", inventoryController.getInventoryByProductId);
router.put("/:productId", inventoryController.updateInventory);
router.patch("/:productId/adjust", inventoryController.adjustInventory);
router.put("/:productId/reserve", inventoryController.reserveStock);
router.put("/:productId/release", inventoryController.releaseStock);
router.put("/:productId/deduct", inventoryController.deductStock);

module.exports = router;
