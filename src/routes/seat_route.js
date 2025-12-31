const express = require('express')
const router = express.Router()
const seatController = require('../controllers/seat_controller')


router.post('/keep_seat', seatController.keepSeat)

router.post('/cancel_seat', seatController.cancelSeat)

router.post('/book_seat', seatController.bookSeat)

router.get('/list_seat', seatController.getListSeat)

router.post('/check_seat', seatController.checkSeat)

router.get('/', seatController.insertData)

module.exports = router