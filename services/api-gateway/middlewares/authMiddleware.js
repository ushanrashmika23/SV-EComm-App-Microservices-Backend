const jwt = require("jsonwebtoken");

const extractBearerToken = (authHeader = "") => {
    if (!authHeader.startsWith("Bearer ")) {
        return null;
    }

    return authHeader.slice(7).trim();
};

const buildVisitorUser = () => ({
    role: "visitor",
    isVisitor: true,
});

const buildAuthenticatedUser = (payload) => ({
    userId: payload.userId,
    role: payload.role,
    isVisitor: false,
});

const authorize = (allowedRoles = [], options = {}) => {
    const { allowVisitor = false } = options;

    return (req, res, next) => {
        if (req.method === "OPTIONS") {
            return next();
        }

        const token = extractBearerToken(req.headers.authorization);

        if (!token) {
            if (allowVisitor) {
                req.user = buildVisitorUser();
                return next();
            }

            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Gateway auth is not configured",
            });
        }

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = buildAuthenticatedUser(payload);

            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied for your role",
                });
            }

            return next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
    };
};

module.exports = {
    authorize,
};
