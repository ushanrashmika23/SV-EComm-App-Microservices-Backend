const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");
const { authorizeRoles } = require("../middlewares/authMiddleware");

router.post("/", authorizeRoles(["admin"]), controller.createProduct);
router.get("/", authorizeRoles([], { allowVisitor: true }), controller.getProducts);
router.get("/:id", authorizeRoles([], { allowVisitor: true }), controller.getProduct);
router.delete("/:id", authorizeRoles(["admin"]), controller.deleteProduct);
router.put("/:id", authorizeRoles(["admin"]), controller.updateProduct);
router.get("/category/:categoryId", authorizeRoles([], { allowVisitor: true }), controller.getProductByCategory);

module.exports = router;