const express = require("express");
const emailController = require("../controllers/emailController");
const { authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/templates", authorizeRoles(["admin", "customer"]), emailController.getTemplates);
router.post("/send", authorizeRoles(["admin", "customer"]), emailController.sendMail);
router.post("/send-template", authorizeRoles(["admin", "customer"]), emailController.sendTemplateMail);

module.exports = router;
