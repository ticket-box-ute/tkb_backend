const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ReviewSchem = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    content: {
        type: String,
        required: false
    },
    movieId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    images: {
        type: [String],
        default: undefined
    },
    userName: {
        type: String,
        required: true
    },
    userPhoto: {
        type: String,
        default: null
    },
    timestamp: {
        type: Number,
        required: true
    }
});

module.exports = ReviewSchem;
