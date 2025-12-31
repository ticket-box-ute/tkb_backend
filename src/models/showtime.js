const mongoose = require('mongoose')
const MovieShema = require('./movie')
const CinemaShema = require('./cinema')

const showtimeSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
});

const movieShowtimeSchema = new mongoose.Schema({
    movieId: { type: String },
    cinemaId: { type: String },
    movie: { type: MovieShema },
    cinema: { type: CinemaShema },
    showtimes: [showtimeSchema],
    cityName: { type: String },
    date: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
});


module.exports = movieShowtimeSchema;
