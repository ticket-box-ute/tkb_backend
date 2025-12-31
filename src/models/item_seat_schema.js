const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ItemSeatSchema = new Schema({
    name: { type: String, required: true },
    status: { type: Number, required: true },
    index: { type: Number, required: true },
    type: { type: String, required: true },
    booked: { type: String },
    paymented: { type: Boolean }

});

module.exports = ItemSeatSchema;