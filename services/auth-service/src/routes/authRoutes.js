const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authorizeRoles } = require("../middlewares/authMiddleware");

router.post("/register", authorizeRoles([], { allowVisitor: true, requireGateway: false }), authController.register);
router.post("/login", authorizeRoles([], { allowVisitor: true, requireGateway: false }), authController.login);

module.exports = router;