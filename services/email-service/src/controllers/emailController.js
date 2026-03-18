const emailService = require("../services/emailService");

const sendMail = async (req, res, next) => {
  try {
    const result = await emailService.sendMail(req.body);
    console.log(`[EmailService] Email sent: ${result.messageId}`);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const sendTemplateMail = async (req, res, next) => {
  try {
    const result = await emailService.sendTemplateMail(req.body);
    console.log(`[EmailService] Template email sent: ${result.messageId}`);

    res.status(200).json({
      success: true,
      message: "Template email sent successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTemplates = async (req, res, next) => {
  try {
    const templates = emailService.getAvailableTemplates();

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMail,
  sendTemplateMail,
  getTemplates,
};
