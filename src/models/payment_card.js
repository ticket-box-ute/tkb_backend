const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const PaymentCardSchema = new mongoose.Schema({
    cardNumber: { type: String, require: true },
    token: { type: String, require: true },
    nameBank: { type: String, require: true },
})

module.exports = PaymentCardSchema