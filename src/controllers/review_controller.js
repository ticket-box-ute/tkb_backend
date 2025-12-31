const ReviewSchema = require('../models/review');
const MovieSchema = require('../models/movie');
const TicketSchema = require('../models/ticket');
const mongoose = require('mongoose');

class ReviewController {

    async getAllReview(req, res) {
        const movieId = req.query.movieId
        const reviewModel = mongoose.model('review', ReviewSchema);
        const page = parseInt(req.query.page)
        const index = parseInt(req.query.index)
        let reviews = {}

        switch (index) {
            case 0:
                reviews = await reviewModel.find({
                    movieId: movieId,
                }).limit(10).skip((page) * 10)
                break;
            case 1:
                reviews = await reviewModel.find({
                    movieId: movieId,
                    images: { "$ne": [] }
                }).limit(10).skip((page) * 10)
                break;
            case 2:
                reviews = await reviewModel.find({
                    movieId: movieId,
                    rating: 5
                }).limit(10).skip((page) * 10)
                break;
            case 3:
                reviews = await reviewModel.find({
                    movieId: movieId,
                    rating: 4
                }).limit(10).skip((page) * 10)
                break;
            case 4:
                reviews = await reviewModel.find({
                    movieId: movieId,
                    rating: 3
                }).limit(10).skip((page) * 10)
                break;
            case 5:
                reviews = await reviewModel.find({
                    movieId: movieId,
                    rating: 2
                }).limit(10).skip((page) * 10)
                break;
            case 6:
                reviews = await reviewModel.find({
                    movieId: movieId,
                    rating: 1
                }).limit(10).skip((page) * 10)
                break;
        }
        res.json({
            "statusCode": 200,
            "data": reviews
        })

    }

    async AddReview(req, res) {
        const review = req.body

        const reviewModel = mongoose.model('review', ReviewSchema);

        const movieModel = mongoose.model('movie', MovieSchema);

        const ticketModel = mongoose.model('ticket', TicketSchema)

        await reviewModel.insertMany(review)

        const movieResponse = await movieModel.findOne({ _id: review.movieId })

        switch (review.rating) {
            case 1:
                movieResponse.total_one_rating++
                break;
            case 2:
                movieResponse.total_two_rating++
                break;
            case 3:
                movieResponse.total_three_rating++
                break;
            case 4:
                movieResponse.total_four_rating++
                break;
            case 5:
                movieResponse.total_five_rating++
                break;
        }

        if (Array.isArray(review.images) && review.images.length > 0) {
            movieResponse.total_rating_picture++
        }

        const totalPoints = (5 * movieResponse.total_five_rating) + (4 * movieResponse.total_four_rating) + (3 * movieResponse.total_three_rating) + (2 * movieResponse.total_two_rating) + (1 * movieResponse.total_one_rating)
        const totalReview = movieResponse.total_five_rating + movieResponse.total_four_rating + movieResponse.total_three_rating + movieResponse.total_two_rating + movieResponse.total_one_rating

        await movieModel.findOneAndUpdate(
            { _id: review.movieId },
            {
                $set: {
                    total_review: movieResponse.total_review + 1,
                    total_one_rating: movieResponse.total_one_rating,
                    total_two_rating: movieResponse.total_two_rating,
                    total_three_rating: movieResponse.total_three_rating,
                    total_four_rating: movieResponse.total_four_rating,
                    total_five_rating: movieResponse.total_five_rating,
                    total_rating_picture: movieResponse.total_rating_picture,
                    rating: totalPoints / totalReview
                }
            }
        )

        res.json({
            "statusCode": 200,
            "data": "success"
        })

        await ticketModel.deleteOne({
            ticketId: review.ticketId
        })

    }
}

module.exports = new ReviewController()

