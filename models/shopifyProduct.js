const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    title: String,
    price: Number,
    sku: String,
    position: Number,
    inventory_quantity: Number,
    created_at: Date,
    updated_at: Date,
});

const ShopifyProductSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    title: String,
    body_html: String,
    vendor: String,
    product_type: String,
    created_at: Date,
    updated_at: Date,
    variants: [VariantSchema],
});

module.exports = mongoose.model('ShopifyProduct', ShopifyProductSchema);
