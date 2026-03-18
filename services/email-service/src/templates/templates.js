const BRAND = {
    name: "SV EComm",
    accent: "#0f766e",
    accentSoft: "#ccfbf1",
    ink: "#0f172a",
    muted: "#475569",
    border: "#e2e8f0",
    bg: "#f8fafc",
};

const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

const statusColor = (status) => {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "DELIVERED") return "#166534";
    if (normalized === "SHIPPED") return "#0c4a6e";
    if (normalized === "PAID") return "#1d4ed8";
    if (normalized === "CANCELLED") return "#b91c1c";
    return "#4c1d95";
};

const renderLayout = ({ eyebrow, title, intro, bodyHtml, ctaText, ctaUrl, footerNote }) => {
    const safeEyebrow = escapeHtml(eyebrow);
    const safeTitle = escapeHtml(title);
    const safeIntro = escapeHtml(intro);
    const safeFooterNote = escapeHtml(footerNote || "Need help? Reply to this email and our support team will assist you.");

    const ctaHtml =
        ctaText && ctaUrl
            ? `
        <tr>
          <td style="padding: 0 32px 28px;">
            <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.2px;">
              ${escapeHtml(ctaText)}
            </a>
          </td>
        </tr>
      `
            : "";

    return `
  <div style="margin:0;padding:24px;background:${BRAND.bg};font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:${BRAND.ink};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;border-collapse:collapse;">
      <tr>
        <td style="padding:0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 50%, #ecfeff 100%);border-bottom:1px solid ${BRAND.border};">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.7px;color:${BRAND.accent};text-transform:uppercase;margin-bottom:10px;">
                  ${safeEyebrow}
                </div>
                <div style="font-size:27px;line-height:1.2;font-weight:800;color:${BRAND.ink};margin:0 0 8px;">
                  ${safeTitle}
                </div>
                <div style="font-size:15px;line-height:1.6;color:${BRAND.muted};margin:0;">
                  ${safeIntro}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 22px;font-size:15px;line-height:1.7;color:${BRAND.ink};">
                ${bodyHtml}
              </td>
            </tr>

            ${ctaHtml}

            <tr>
              <td style="padding:18px 32px 28px;border-top:1px solid ${BRAND.border};font-size:12px;line-height:1.7;color:${BRAND.muted};">
                <div style="margin-bottom:6px;font-weight:700;color:${BRAND.ink};">${BRAND.name}</div>
                <div>${safeFooterNote}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
};

const templates = {
    WELCOME: ({ userName = "Customer" }) => {
        const safeUserName = escapeHtml(userName);

        return {
            subject: "Welcome to SV EComm",
            html: renderLayout({
                eyebrow: "Account Ready",
                title: `Welcome, ${safeUserName}`,
                intro: "Your account is live. You can now discover products and place orders in minutes.",
                bodyHtml: `
          <p style="margin:0 0 12px;">We are excited to have you on board. Your account setup is complete and you are ready to shop.</p>
          <div style="background:${BRAND.accentSoft};border:1px solid #99f6e4;border-radius:12px;padding:14px 16px;color:#115e59;">
            Pro tip: Save your shipping address during checkout to speed up future orders.
          </div>
        `,
                ctaText: "Start Shopping",
                ctaUrl: "https://example.com",
            }),
            text: `Welcome, ${userName}! Your account was created successfully. Start exploring products and placing your first order.`,
        };
    },

    ORDER_CONFIRMED: ({ orderId = "N/A" }) => {
        const safeOrderId = escapeHtml(orderId);

        return {
            subject: `Order Confirmed: ${orderId}`,
            html: renderLayout({
                eyebrow: "Order Confirmed",
                title: "Your order is in",
                intro: "Good news. We have received your order and started processing it.",
                bodyHtml: `
          <p style="margin:0 0 14px;">Your order reference is:</p>
          <div style="display:inline-block;background:#f1f5f9;border:1px dashed #94a3b8;border-radius:10px;padding:10px 14px;font-size:16px;font-weight:800;letter-spacing:0.3px;">
            ${safeOrderId}
          </div>
          <p style="margin:16px 0 0;">You will receive another update as soon as the shipment status changes.</p>
        `,
                ctaText: "Track Order",
                ctaUrl: "https://example.com/orders",
            }),
            text: `Your order ${orderId} has been placed successfully. We will send more updates as it moves forward.`,
        };
    },

    ORDER_STATUS: ({ orderId = "N/A", status = "PENDING" }) => {
        const safeOrderId = escapeHtml(orderId);
        const safeStatus = escapeHtml(status);
        const badgeColor = statusColor(status);

        return {
            subject: `Order ${orderId} is now ${status}`,
            html: renderLayout({
                eyebrow: "Status Update",
                title: "Your order has a new status",
                intro: "We wanted to keep you updated in real time.",
                bodyHtml: `
          <p style="margin:0 0 12px;">Order <strong>${safeOrderId}</strong> is now:</p>
          <span style="display:inline-block;padding:8px 12px;border-radius:999px;background:${badgeColor};color:#ffffff;font-size:12px;font-weight:800;letter-spacing:0.7px;text-transform:uppercase;">
            ${safeStatus}
          </span>
          <p style="margin:16px 0 0;">If you have questions, reply to this email and we will help right away.</p>
        `,
                ctaText: "View Order Details",
                ctaUrl: "https://example.com/orders",
            }),
            text: `Your order ${orderId} is now ${status}.`,
        };
    },

    PASSWORD_RESET: ({ resetLink = "https://example.com/reset" }) => {
        const safeResetLink = escapeHtml(resetLink);

        return {
            subject: "Password Reset Request",
            html: renderLayout({
                eyebrow: "Security",
                title: "Reset your password",
                intro: "A password reset was requested for your account.",
                bodyHtml: `
          <p style="margin:0 0 12px;">For your security, this reset link is time-sensitive.</p>
          <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:12px 14px;color:#9a3412;font-size:13px;">
            If you did not request this, you can ignore this email. Your password will remain unchanged.
          </div>
          <p style="margin:14px 0 0;font-size:13px;color:${BRAND.muted};word-break:break-all;">Backup link: ${safeResetLink}</p>
        `,
                ctaText: "Reset Password",
                ctaUrl: resetLink,
            }),
            text: `Use this link to reset your password: ${resetLink}`,
        };
    },
};

module.exports = templates;
