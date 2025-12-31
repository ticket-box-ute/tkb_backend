const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const FoodItemSchema = new mongoose.Schema({
    thumbnail: { type: String },
    name: { type: String },
    price: { type: Number },
    description: { type: String },
})

const FoodSchema = new mongoose.Schema({
    type: { type: String },
    data: { type: [FoodItemSchema] }
})

module.exports = FoodSchema

