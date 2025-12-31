const express = require('express')
const router = express.Router()
const showtimesController = require('../controllers/showtimes_controller')

router.get('/cinema', showtimesController.getShowtimeCinema)

router.get('/movie', showtimesController.getShowtimeMoviee)

module.exports = router