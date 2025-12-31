const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actor = new mongoose.Schema({
    name: { type: String, required: true },
    thumbnail: { type: String, required: true }
});

module.exports = actor