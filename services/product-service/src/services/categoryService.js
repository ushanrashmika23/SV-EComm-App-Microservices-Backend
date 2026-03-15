const categoryModel = require('../models/categoryModel');

exports.createCategory = async (data) => {
    return await categoryModel.createCategory(data);
};

exports.getCategories = async () => {
    return await categoryModel.getCategories();
};

exports.getCategoryById = async (id) => {
    return await categoryModel.getCategoryById(id);
};

exports.deleteCategory = async (id) => {
    return await categoryModel.deleteCategory(id);
};

