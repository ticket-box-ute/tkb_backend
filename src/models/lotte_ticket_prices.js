const mongoose = require('mongoose');

const SeatPriceSchema = new mongoose.Schema({
    normal_seat: { type: Number, required: true },
    vip_seat: { type: Number, required: true },
    sweetbox_seat: { type: Number, required: true }
});

const TimePriceSchema = new mongoose.Schema({
    before_5_pm: { type: SeatPriceSchema, required: true },
    after_5_pm: { type: SeatPriceSchema, required: true }
});

const LottieTicketPricesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    category: { type: String, required: true },
    "2D": { type: TimePriceSchema, required: true },
    "3D": { type: TimePriceSchema, required: true }
});


module.exports = LottieTicketPricesSchema;
