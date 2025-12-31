const mongoose = require('mongoose')

const showtimeSchema = new mongoose.Schema({
    _id: { type: String, required: false },
    roomId: {
        type: String,
        required: false
    },
    time: {
        type: String,
        required: false
    },
});

module.export = showtimeSchema