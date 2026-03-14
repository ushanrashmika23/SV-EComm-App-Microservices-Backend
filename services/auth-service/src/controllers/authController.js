const authService = require("../services/authService");

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const user = await authService.register(email, password, name);
        res.status(201).json({
            message: "User registered",
            user,
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await authService.login(email, password);
        res.json(data);
    } catch (error) {
        res.status(401).json({
            error: error.message,
        });
    }
};

module.exports = {
    register,
    login,
};