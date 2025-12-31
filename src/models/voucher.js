const mongoose = require('mongoose')

const VoucherSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    expiredTime: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
    applicableForBill: { type: Number, required: true },
    description: { type: String, required: true },
    listUidUsed: { type: [String], default: [] }
});

module.exports = VoucherSchema;