const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const ItemSeatSchema = require('../models/item_seat_schema')

const SeatSchema = new Schema({
    _id: { type: ObjectId, required: false },
    cinemaId: { type: String, required: false },
    showtimesId: { type: String, required: false },
    seats: { type: [ItemSeatSchema], required: false }
})

module.exports = SeatSchema;
