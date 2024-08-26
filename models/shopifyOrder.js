const mongoose = require('mongoose');
const ShopifyOrderSchema = new mongoose.Schema({
    total_price_set: {
        shop_money: {
            amount: Number,
            currency_code: String
        }
    },
    created_at: Date,
});
module.exports = mongoose.model('ShopifyOrder', ShopifyOrderSchema);
