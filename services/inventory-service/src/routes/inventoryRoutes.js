const express = require("express");
const inventoryController = require("../controllers/inventoryController");
const { authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authorizeRoles(["admin"]), inventoryController.createInventory);
router.get("/", authorizeRoles(["admin"]), inventoryController.getAllInventory);
router.get("/:productId", authorizeRoles(["admin"]), inventoryController.getInventoryByProductId);
router.put("/:productId", authorizeRoles(["admin"]), inventoryController.updateInventory);
router.patch("/:productId/adjust", authorizeRoles(["admin"]), inventoryController.adjustInventory);
router.put("/:productId/reserve", authorizeRoles(["admin"]), inventoryController.reserveStock);
router.put("/:productId/release", authorizeRoles(["admin"]), inventoryController.releaseStock);
router.put("/:productId/deduct", authorizeRoles(["admin"]), inventoryController.deductStock);

module.exports = router;
