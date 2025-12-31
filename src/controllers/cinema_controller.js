const CinemaShema = require('../models/cinema')
const mongoose = require('mongoose');
const HolidaySchema = require('../models/holiday')
const CGVTicketPriceSchema = require('../models/cgv_ticket_prices')
const GalaxyTicketPriceSchema = require('../models/galaxy_ticket_prices')
const LotteTicketPriceSchema = require('../models/lotte_ticket_prices')
const moment = require('moment');
const CGVTicketPricesSchema = require('../models/cgv_ticket_prices');
const FoodSchema = require('../models/food');



class CinemaController {
    async allCinemaCity(req, res) {
        const cityName = req.query.cityName
        const cinemaModel = mongoose.model('cinema', CinemaShema)

        // Xử lý trường hợp "Hồ Chí Minh" có thể là "Thành phố Hồ Chí Minh" trong DB
        const cityNameQuery = cityName === "Hồ Chí Minh"
            ? { $in: ["Hồ Chí Minh", "Thành phố Hồ Chí Minh"] }
            : cityName;

        const cgv = await cinemaModel.find({
            cityName: cityNameQuery,
            type: "CGV"
        })

        const lotte = await cinemaModel.find({
            cityName: cityNameQuery,
            type: "Lotte"
        })

        const galaxy = await cinemaModel.find({
            cityName: cityNameQuery,
            type: "Galaxy"
        })

        res.json({
            'statusCode': 200,
            'data': {
                "cgv": cgv,
                "lotte": lotte,
                "galaxy": galaxy
            }
        })
    }

    async getTicketPrices(req, res) {
        const date = req.query.date

        const dateSelected = moment.utc(date, "DD/MM/YYYY").toDate();

        const holidayModel = mongoose.model("holiday", HolidaySchema)
        const cgvTicketPriceModel = mongoose.model('cgv_ticket_price', CGVTicketPriceSchema)
        const galaxyTicketPriceModel = mongoose.model('galaxy_ticket_price', GalaxyTicketPriceSchema)
        const lotteTicketPriceModel = mongoose.model('lotte_ticket_price', LotteTicketPriceSchema)

        let cgvResponse
        let galaxyResponse
        let lotteResponse

        const holidays = await holidayModel.find({})

        let isHoliday = false
        let isWeekend = false
        let isSpecialDayCGV = false
        let isSpecialDayGalaxy = false
        let isSpecialDayLotte = false

        for (let index = 0; index < holidays.length; index++) {
            const element = holidays[index];
            const startDate = moment.utc(element.startDate, "DD/MM/YYYY").toDate()
            const endDate = moment.utc(element.endDate, "DD/MM/YYYY").toDate()

            if (dateSelected >= startDate && dateSelected <= endDate) {
                isHoliday = true
                break
            }

        }

        if (!isHoliday) {
            switch (dateSelected.getDay()) {
                case 0:
                    isWeekend = true
                    break;
                case 6:
                    isWeekend = true
                    break;
            }
        }

        if (!isWeekend) {
            if (dateSelected.getDay() == 3) {
                isSpecialDayCGV = true
            }
            if (dateSelected.getDay() == 2) {
                isSpecialDayGalaxy = true
                isSpecialDayLotte = true
            }
        }

        if (isWeekend || isHoliday) {

            cgvResponse = await cgvTicketPriceModel.findOne({ category: "weekend" })

            galaxyResponse = await galaxyTicketPriceModel.findOne({ category: "weekend" })

            lotteResponse = await lotteTicketPriceModel.findOne({ category: "weekend" })

        } else {
            if (isSpecialDayCGV) {
                cgvResponse = await cgvTicketPriceModel.findOne({ category: "happy_wednesday" })
            } else {
                cgvResponse = await cgvTicketPriceModel.findOne({ category: "weekday" })
            }

            if (isSpecialDayGalaxy) {
                galaxyResponse = await galaxyTicketPriceModel.findOne({ category: "happy_tuesday" })
            } else {
                galaxyResponse = await galaxyTicketPriceModel.findOne({ category: "weekday" })
            }

            if (isSpecialDayLotte) {
                lotteResponse = await lotteTicketPriceModel.findOne({ category: "lovely_tuesday" })
            } else {
                lotteResponse = await lotteTicketPriceModel.findOne({ category: "weekday" })
            }
        }

        res.json({
            statusCode: 200,
            data: {
                "cgv": cgvResponse,
                "galaxy": galaxyResponse,
                "lotte": lotteResponse,
            }
        })

    }

    async getFood(req, res) {
        const foodModel = mongoose.model('food', FoodSchema)

        const responseCGV = await foodModel.findOne({ type: "CGV" })
        const responseGalaxy = await foodModel.findOne({ type: "Galaxy" })
        const responseLotte = await foodModel.findOne({ type: "Lotte" })

        res.json({
            "statusCode": 200,
            "data": {
                "cgv": responseCGV,
                "lotte": responseLotte,
                "galaxy": responseGalaxy,
            },
        })
    }
}


module.exports = new CinemaController()