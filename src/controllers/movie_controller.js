const MovieShema = require('../models/movie');
const mongoose = require('mongoose');

class MovieController {
    async all(req, res) {
        const movie = mongoose.model('movie', MovieShema);

        const response = await movie.find({})
        res.json({
            "statusCode": 200,
            "data": {
                response
            }

        })
    }
}

module.exports = new MovieController()