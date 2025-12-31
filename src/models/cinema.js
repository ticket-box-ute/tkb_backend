const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Room = require('./room')

const cinema = new mongoose.Schema({
    _id: { type: ObjectId, required: false },
    thumbnail: { type: String, required: false },
    name: { type: String, required: false },
    type: { type: String, required: false },
    cityName: { type: String, required: false },
    rooms: { type: [Room], require: false },
    lat: { type: Number, required: false },
    long: { type: Number, required: false },
    address: { type: String, required: false }
});

module.exports = cinema