const { type } = require('express/lib/response');
const mongoose = require('mongoose')
const PaymentCardSchema = require('./payment_card')

const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    photoUrl: { type: String },
    displayName: { type: String },
    email: { type: String, required: true },
    birthDay: { type: String, required: false, default: '' },
    paymentCards: { type: [PaymentCardSchema], require: false, default: [] },
});

module.exports = UserSchema;