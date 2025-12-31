const mongoose = require('mongoose')

const SeatPriceSchema = new mongoose.Schema({
    normal_seat: { type: Number, required: true },
    vip_seat: { type: Number, required: true },
    sweetbox_seat: { type: Number, required: true }
});

const CGVTicketPricesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    category: { type: String, required: true },
    "2D": { type: SeatPriceSchema, required: true },
    "3D": { type: SeatPriceSchema, required: true }
});

module.exports = CGVTicketPricesSchema;