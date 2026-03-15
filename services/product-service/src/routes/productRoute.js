const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");

router.post("/", controller.createProduct);
router.get("/", controller.getProducts);
router.get("/:id", controller.getProduct);
router.delete("/:id", controller.deleteProduct);
router.put("/:id", controller.updateProduct);
router.get("/category/:categoryId", controller.getProductByCategory);

module.exports = router;