const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
    startDate: { type: String, require: true },
    endDate: { type: String, require: true },
})

module.exports = HolidaySchema;