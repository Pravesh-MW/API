const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    address1: String,
    address2: String,
    city: String,
    province: String,
    country: String,
    zip: String,
});

const ShopifyCustomerSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    email: String,
    first_name: String,
    last_name: String,
    created_at: Date,
    updated_at: Date,
    phone: String,
    orders_count: Number,
    total_spent: Number,
    last_order_id: String,
    default_address: AddressSchema,
});

module.exports = mongoose.model('ShopifyCustomer', ShopifyCustomerSchema);
