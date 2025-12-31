const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/review_controller')

router.post('/add_review', reviewController.AddReview)

router.get('/', reviewController.getAllReview)

module.exports = router