const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Actor = require('./actor')

const MovieShema = new mongoose.Schema({
    _id: { type: ObjectId, required: false },
    content: { type: String, required: false },
    thumbnail: { type: String, required: false },
    total_five_rating: { type: Number, required: false },
    status: { type: Number, required: false },
    total_three_rating: { type: Number, required: false },
    duration: { type: Number, required: false },
    actors: { type: [Actor], required: false },
    trailer: { type: String, required: false },
    total_four_rating: { type: Number, required: false },
    nation: { type: String, required: false },
    name: { type: String, required: false },
    total_two_rating: { type: Number, required: false },
    id: { type: String, required: false },
    date: { type: String, required: false },
    total_review: { type: Number, required: false },
    banner: { type: String, required: false },
    director: { type: String, required: false },
    total_one_rating: { type: Number, required: false },
    ban: { type: String, required: false },
    total_rating_picture: { type: Number, required: false },
    languages: { type: [String], required: false },
    categories: { type: [String], required: false },
    rating: { type: Number, required: false },
    totalPurchases: { type: Number, required: false }
});

module.exports = MovieShema