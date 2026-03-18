const { transporter } = require("../config/smtp");
const templates = require("../templates/templates");
const HttpError = require("../utils/httpError");

const buildFrom = () => {
    const fromName = process.env.EMAIL_FROM_NAME || "SV EComm";
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER;

    if (!fromAddress) {
        throw new HttpError("EMAIL_FROM_ADDRESS or SMTP_USER must be configured", 500);
    }

    return `\"${fromName}\" <${fromAddress}>`;
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const sendMail = async ({ to, subject, text, html, cc, bcc, replyTo }) => {
    if (!to || typeof to !== "string" || !validateEmail(to)) {
        throw new HttpError("A valid 'to' email is required", 400);
    }

    if (!subject || typeof subject !== "string") {
        throw new HttpError("subject is required", 400);
    }

    if (!text && !html) {
        throw new HttpError("Either text or html content is required", 400);
    }

    const mailOptions = {
        from: buildFrom(),
        to,
        subject,
        text,
        html,
        cc,
        bcc,
        replyTo,
    };

    try {
        const result = await transporter.sendMail(mailOptions);

        return {
            messageId: result.messageId,
            accepted: result.accepted,
            rejected: result.rejected,
            response: result.response,
        };
    } catch (error) {
        throw new HttpError(`SMTP send failed: ${error.message}`, 502);
    }
};

const sendTemplateMail = async ({ to, templateKey, templateData = {}, cc, bcc, replyTo }) => {
    if (!templateKey || !templates[templateKey]) {
        throw new HttpError("Invalid templateKey", 400);
    }

    const template = templates[templateKey](templateData);

    return sendMail({
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
        cc,
        bcc,
        replyTo,
    });
};

const getAvailableTemplates = () => {
    return Object.keys(templates);
};

module.exports = {
    sendMail,
    sendTemplateMail,
    getAvailableTemplates,
};
