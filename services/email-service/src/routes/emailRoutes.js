const express = require("express");
const emailController = require("../controllers/emailController");

const router = express.Router();

router.get("/templates", emailController.getTemplates);
router.post("/send", emailController.sendMail);
router.post("/send-template", emailController.sendTemplateMail);

module.exports = router;
