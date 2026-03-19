const authorizeRoles = (allowedRoles = [], options = {}) => {
    const { allowVisitor = false, requireGateway = true } = options;

    return (req, res, next) => {
        const auth = req.auth || {};

        if (requireGateway && !auth.fromGateway) {
            return res.status(401).json({
                success: false,
                message: "Request must come through API gateway",
            });
        }

        if (auth.isVisitor) {
            if (allowVisitor) {
                return next();
            }

            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied for your role",
            });
        }

        return next();
    };
};

module.exports = {
    authorizeRoles,
};
