const mongoose = require('mongoose')
const MovieShema = require('../models/movie')
const ItemSeatSchema = require('../models/item_seat_schema')
const TimeSchema = require('../models/time')
const CinemaSchema = require('../models/cinema')

const TicketSchema = new mongoose.Schema({
    _id: { type: String, required: false },
    ticketId: { type: String, required: false },
    movie: { type: MovieShema, required: false },
    quantity: { type: Number, required: false },
    price: { type: Number, required: false },
    seats: { type: [ItemSeatSchema], required: false },
    uid: { type: String, required: false },
    date: { type: String, required: false },
    showtimes: { type: TimeSchema, required: false },
    cinema: { type: CinemaSchema, required: false },
    isExpired: { type: Number, required: false },
    timestamp: { type: Number, required: false }
});

module.exports = TicketSchema