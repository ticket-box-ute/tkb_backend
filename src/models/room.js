const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const room = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    column: { type: Number, required: true },
    row: { type: Number, required: true }
});

module.exports = room