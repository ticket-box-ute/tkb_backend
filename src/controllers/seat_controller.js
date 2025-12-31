const SeatSchema = require("../models/seat")
const mongoose = require('mongoose');
const userController = require('../controllers/user_controller')
const ticketController = require('../controllers/ticket_controller')
const TicketSchema = require('../models/ticket');

class SeatController {

    async insertData(req, res) {
        const SeatModel = mongoose.model('seats_in_showtime', SeatSchema);
        const cinemaId = req.query.cinemaId;
        const column = parseInt(req.query.column);
        const row = parseInt(req.query.row);
        const showtimesId = req.query.showtimesId;
        const roomId = req.query.roomId;

        const listSeat = [];
        let index = 0;
        for (let i = 0; i < column; i++) {
            for (let j = 1; j <= row; j++) {
                listSeat.push({
                    "name": getNameSeat(i) + j,
                    "status": 0,
                    "price": getPrice(getType(i)),
                    "index": index,
                    "type": getType(i),
                    "booked": "",
                });
                index++;
            }
        }

        await SeatModel.insertMany({
            "cinemaId": cinemaId,
            "showtimesId": showtimesId,
            "roomId": roomId,
            "seats": listSeat,
        });

        res.json({
            "message": "success"
        });

        function getNameSeat(column) {
            let name = "A";
            switch (column) {
                case 0:
                    name = "A";
                    break;
                case 1:
                    name = "B";
                    break;
                case 2:
                    name = "C";
                    break;
                case 3:
                    name = "D";
                    break;
                case 4:
                    name = "E";
                    break;
                case 5:
                    name = "F";
                    break;
                case 6:
                    name = "G";
                    break;
                case 7:
                    name = "H";
                    break;
                case 8:
                    name = "I";
                    break;
                case 9:
                    name = "J";
                    break;
                case 10:
                    name = "K";
                    break;
                case 11:
                    name = "L";
                    break;
                case 12:
                    name = "M";
                    break;
                case 13:
                    name = "N";
                    break;
                case 14:
                    name = "O";
                    break;
                case 15:
                    name = "P";
                    break;
                default:
                    name = "A";
                    break;
            }
            return name;
        }

        function getType(column) {
            if (column > 7) {
                return "vip"
            }
            else {
                return "normal"
            }
        }

        function getPrice(type) {
            if (type == "vip") {
                return 90000
            }
            return 70000
        }
    }

    async getListSeat(req, res) {
        const seatModel = mongoose.model('seats_in_showtime', SeatSchema);
        const showtimesId = req.query.showtimesId;

        const response = await seatModel.findOne({
            "showtimesId": showtimesId
        });

        res.json({
            "statusCode": 200,
            "data": response
        });
    }

    async keepSeat(req, res) {
        const { listSeat, showtimesId, uid } = req.body;

        const length = parseInt(listSeat.length);

        const seatModel = mongoose.model('seats_in_showtime', SeatSchema);

        const response = await seatModel.findOne({ showtimesId: showtimesId });

        let isBooked = false;

        for (let index = 0; index < length; index++) {
            if (response.seats[listSeat[index]].status == 1) {
                isBooked = true;
                break;
            }
        }

        if (isBooked) {
            res.json({
                "statusCode": 200,
                "message": "Ghế này đã được đặt"
            });
        } else {
            for (let index = 0; index < length; index++) {
                await seatModel.updateOne({ showtimesId: showtimesId }, {
                    $set: {
                        [`seats.${listSeat[index]}.status`]: 1,
                        [`seats.${listSeat[index]}.booked`]: uid,
                    }
                });
            }

            setTimeout(async () => {

                const seatModel = mongoose.model('seats_in_showtime', SeatSchema);

                const response = await seatModel.findOne({ showtimesId: showtimesId });

                const listSeatNotBooked = []

                for (let index = 0; index < listSeat.length; index++) {
                    if (response.seats[listSeat[index]].paymented == true) continue
                    if (response.seats[listSeat[index]].status == 1 && response.seats[listSeat[index]].booked == uid) {
                        listSeatNotBooked.push(listSeat[index])
                    }
                }

                for (let index = 0; index < listSeatNotBooked.length; index++) {

                    console.log("cancel seat");

                    await seatModel.updateOne({ showtimesId: showtimesId }, {
                        $set: {
                            [`seats.${listSeat[index]}.status`]: 0,
                            [`seats.${listSeat[index]}.booked`]: "",
                        }
                    });
                }
            }, 300000);

            res.json({
                "statusCode": 200,
                "data": "Success"
            });
        }
    }

    async cancelSeat(req, res) {

        const { listSeat, showtimesId, uid } = req.body;

        const length = parseInt(listSeat.length);

        const seatModel = mongoose.model('seats_in_showtime', SeatSchema);

        const response = await seatModel.findOne({ showtimesId: showtimesId });

        let listSeatNotBooked = [];

        for (let index = 0; index < length; index++) {
            if ((response.seats[listSeat[index]].booked == "" || response.seats[listSeat[index]].booked == uid) && !response.seats[listSeat[index]].paymented) {
                listSeatNotBooked.push(listSeat[index]);
            }
        }

        for (let index = 0; index < listSeatNotBooked.length; index++) {
            await seatModel.updateOne({ showtimesId: showtimesId }, {
                $set: {
                    [`seats.${listSeatNotBooked[index]}.status`]: 0,
                    [`seats.${listSeatNotBooked[index]}.booked`]: "",
                }
            });
        }

        res.json({
            "statusCode": 200,
            "data": "Success"
        });
    }

    async checkSeat(req, res) {
        const ticket = req.body;

        const length = parseInt(ticket.seats.length);

        const seatModel = mongoose.model('seats_in_showtime', SeatSchema);

        const response = await seatModel.findOne({ showtimesId: ticket.showtimes._id });

        let listSeatNotBooked = [];
        let listSeatBookedByOther = [];

        for (let index = 0; index < length; index++) {
            if (response.seats[ticket.seats[index].index].booked == "" || response.seats[ticket.seats[index].index].booked == ticket.uid) {
                listSeatNotBooked.push(ticket.seats[index]);
            } else {
                listSeatBookedByOther.push(ticket.seats[index]);
            }
        }

        if (listSeatBookedByOther.length > 0) {
            res.json({
                "statusCode": 200,
                "data": false
            });
        } else {
            for (let index = 0; index < listSeatNotBooked.length; index++) {
                await seatModel.updateOne({ showtimesId: ticket.showtimes._id }, {
                    $set: {
                        [`seats.${listSeatNotBooked[index].index}.status`]: 1,
                        [`seats.${listSeatNotBooked[index].index}.booked`]: ticket.uid,
                    }
                });
            }

            res.json({
                "statusCode": 200,
                "data": true
            });
        }
    }

    async bookSeat(req, res) {
        const ticket = req.body;

        const length = parseInt(ticket.seats.length);

        const seatModel = mongoose.model('seats_in_showtime', SeatSchema);

        for (let index = 0; index < length; index++) {
            await seatModel.updateOne({ showtimesId: ticket.showtimes._id }, {
                $set: {
                    [`seats.${ticket.seats[index].index}.status`]: 1,
                    [`seats.${ticket.seats[index].index}.booked`]: ticket.uid,
                    [`seats.${ticket.seats[index].index}.paymented`]: true
                }
            });
        }

        await ticketController.addTicket(ticket);
        if (ticket['voucher'] != null) {
            await userController.removeVoucher(ticket['voucher']['_id'], ticket['uid'])
        }

        res.json({
            "statusCode": 200,
            "data": "success"
        });
    }
}

module.exports = new SeatController()
