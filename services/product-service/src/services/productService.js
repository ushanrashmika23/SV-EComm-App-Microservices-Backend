const productModel = require("../models/productModel");

exports.createProduct = async (data) => {
    return await productModel.createProduct(data);
};

exports.getProducts = async (limit, offset) => {
    return await productModel.getProducts(limit, offset);
};

exports.getProductById = async (id) => {
    return await productModel.getProductById(id);
};

exports.deleteProduct = async (id) => {
    return await productModel.deleteProduct(id);
};

exports.updateProduct = async (id, data) => {
    return await productModel.updateProduct(id, data);
};

exports.getProductByCategory = async (categoryId, limit, offset) => {
    return await productModel.getProductByCategory(categoryId, limit, offset);
};