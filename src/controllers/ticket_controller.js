const mongoose = require('mongoose');
const TicketSchema = require('../models/ticket');
const MovieSchema = require('../models/movie');
const { tick } = require('mongoose/lib/utils');

class TicketController {
    async addTicket(ticket) {

        const ticketModel = mongoose.model('ticket', TicketSchema)

        const movieModel = mongoose.model('movie', MovieSchema)

        const response = await ticketModel.insertMany(ticket)

        const movie = await movieModel.findOne({ _id: ticket.movie._id })

        // totalPurchases là số lượng vé đã bán (không phải tổng tiền)
        const currentPurchases = (typeof movie.totalPurchases === 'number' && !isNaN(movie.totalPurchases))
            ? movie.totalPurchases
            : 0;

        // Tăng số lượng vé đã bán lên 1
        await movieModel.findOneAndUpdate(
            { _id: ticket.movie._id },
            { $set: { totalPurchases: currentPurchases + 1 } }
        )

        return response.ticketId
    }

    async getListTicket(req, res) {
        const uid = req.query.uid


        const ticketModel = mongoose.model('ticket', TicketSchema)

        const response = await ticketModel.find({
            uid: uid
        }).sort({ timestamp: -1 });

        res.json({
            "statusCode": 200,
            "data": response
        })

    }
}

module.exports = new TicketController()