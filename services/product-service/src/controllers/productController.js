const productService = require("../services/productService");
const { getPagination } = require("../utils/pagination");
const { v4: uuidv4 } = require("uuid");

exports.createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct({
            id: uuidv4(),
            ...req.body
        });

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { offset } = getPagination(page, limit);

        const products = await productService.getProducts(limit, offset);

        res.json({
            page,
            limit,
            data: products
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.json({ message: "Product deleted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getProductByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { offset } = getPagination(page, limit);

        const products = await productService.getProductByCategory(categoryId, limit, offset);

        res.json({
            page,
            limit,
            data: products
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};