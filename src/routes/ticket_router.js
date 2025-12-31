const express = require('express')
const router = express.Router()
const ticketController = require('../controllers/ticket_controller')

router.get('/get_list_ticket', ticketController.getListTicket)

module.exports = router