const mongoose = require('mongoose');
const MovieShema = require('../models/movie');
const Banner = require('../models/banner')

class HomeController {
    async getHome(req, res) {
        const movieModel = mongoose.model('movie', MovieShema)
        const movie = await movieModel.find({})
        const banners = await Banner.find({})
        res.json({
            "statusCode": 200,
            "data": {
                banners,
                nowShowings: movie.filter(element => element.status === 1),
                comingSoons: movie.filter(element => element.status === 0),
            }
        })
    }
}

module.exports = new HomeController()