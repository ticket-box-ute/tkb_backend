const mongoose = require('mongoose');

const SeatPriceSchema = new mongoose.Schema({
    before_5_pm: { type: Number, required: true },
    after_5_pm: { type: Number, required: true }
});

const GalaxyTicketPricesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    category: { type: String, required: true },
    "2D": { type: SeatPriceSchema, required: true },
    IMAX: { type: SeatPriceSchema, required: true }
});


module.exports = GalaxyTicketPricesSchema;
