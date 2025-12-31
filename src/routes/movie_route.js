const express = require('express')
const router = express.Router()
const movieController = require('../controllers/movie_controller')

router.get('/', movieController.all)

module.exports = router