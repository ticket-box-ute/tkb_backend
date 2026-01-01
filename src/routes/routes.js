const movieRouter = require('./movie_route')
const cinemaRouter = require('./cinema_route')
const homeRouter = require('./home_route')
const reviewRouter = require('./review_route')
const seatRouter = require('./seat_route')
const showtimesRouter = require('./showtimes_route')
const userRouter = require('./user_router')
const ticketRouter = require('./ticket_router')
const chatRouter = require('./chat_route')

function routes(app) {
    app.use('/movie', movieRouter)

    app.use('/cinema', cinemaRouter)

    app.use('/home', homeRouter)

    app.use('/review', reviewRouter)

    app.use('/showtimes', showtimesRouter)

    app.use('/seat', seatRouter)

    app.use('/user', userRouter)

    app.use('/ticket', ticketRouter)

    app.use('/chat', chatRouter)
}

module.exports = routes