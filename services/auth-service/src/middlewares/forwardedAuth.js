const parseForwardedAuth = (req, res, next) => {
    const fromGateway = req.headers["x-gateway-source"] === "api-gateway";

    if (!fromGateway) {
        req.auth = {
            userId: null,
            role: "visitor",
            isVisitor: true,
            fromGateway: false,
        };

        return next();
    }

    const userIdHeader = req.headers["x-user-id"];
    const roleHeader = req.headers["x-user-role"];
    const visitorHeader = req.headers["x-visitor-mode"];

    const userId = typeof userIdHeader === "string" && userIdHeader.trim() ? userIdHeader : null;
    const role = typeof roleHeader === "string" && roleHeader.trim() ? roleHeader : "visitor";
    const isVisitor = visitorHeader === "true" || role === "visitor" || !userId;

    req.auth = {
        userId,
        role,
        isVisitor,
        fromGateway: true,
    };

    return next();
};

module.exports = {
    parseForwardedAuth,
};
