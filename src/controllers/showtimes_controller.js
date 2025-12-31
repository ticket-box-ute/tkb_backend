const ShowtimesModel = require('../models/showtime');
const MovieShema = require('../models/movie')
const CinemaShema = require('../models/cinema')
const mongoose = require('mongoose');

class ShowtimesController {
    async getShowtimeCinema(req, res) {
        const cinemaId = req.query.cinemaId
        const date = req.query.date
        const showtimeCinemModel = mongoose.model('showtime', ShowtimesModel);
        const movieModel = mongoose.model('movie', MovieShema)

        const showtimes = await showtimeCinemModel.find({
            date: date,
            cinemaId: cinemaId,
        })

        const data = []

        for (let index = 0; index < showtimes.length; index++) {
            const movie = await movieModel.findOne({ _id: showtimes[index].movieId })

            data.push(
                {
                    "movie": movie,
                    "date": showtimes[index].date,
                    "times": showtimes[index].showtimes,
                    "type": showtimes[index].type,
                }
            )
        }

        res.json({
            "statusCode": 200,
            "data": data
        })
    }

    async getShowtimeMoviee(req, res) {
        const cityName = req.query.cityName
        const movieId = req.query.movieId
        const date = req.query.date
        const showtimeCinemModel = mongoose.model('showtime', ShowtimesModel);
        const cinemaModel = mongoose.model('cinema', CinemaShema)

        // Xử lý trường hợp "Hồ Chí Minh" có thể là "Thành phố Hồ Chí Minh" trong DB
        const cityNameQuery = cityName === "Hồ Chí Minh"
            ? { $in: ["Hồ Chí Minh", "Thành phố Hồ Chí Minh"] }
            : cityName;

        const showtimes = await showtimeCinemModel.find({
            date: date,
            movieId: movieId,
            cityName: cityNameQuery
        })

        const data = []

        for (let index = 0; index < showtimes.length; index++) {
            const cinema = await cinemaModel.findOne({ _id: showtimes[index].cinemaId })

            data.push({
                "cinema": cinema,
                "date": showtimes[index].date,
                "times": showtimes[index].showtimes,
                "type": showtimes[index].type,
            })
        }

        res.json({
            "statusCode": 200,
            "data": data
        })
    }
}

module.exports = new ShowtimesController()