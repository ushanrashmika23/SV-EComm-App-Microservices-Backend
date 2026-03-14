const userModel = require("../models/userModel");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");

const register = async (email, password, name) => {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await hashPassword(password);
    const user = await userModel.createUser(email, hashedPassword, name);
    return user;
};

const login = async (email, password) => {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
        throw new Error("Invalid credentials");
    }
    const token = generateToken({
        userId: user.id,
        role: user.role,
    });
    // Update the user's token in the database
    await userModel.updateUserToken(user.id, token);
    return { user, token };
};

module.exports = {
    register,
    login,
};