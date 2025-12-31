const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Banner = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    movieId: { type: String, required: true }
});

module.exports = mongoose.model('Banner', Banner);
