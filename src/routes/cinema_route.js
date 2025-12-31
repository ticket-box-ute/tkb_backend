const express = require('express')
const router = express.Router()
const cinemaController = require('../controllers/cinema_controller')

router.get('/', cinemaController.allCinemaCity)

router.get('/ticket_price', cinemaController.getTicketPrices)

router.get('/food', cinemaController.getFood)

module.exports = router