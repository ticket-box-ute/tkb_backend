const mongoose = require('mongoose');
const UserSchema = require('../models/user')
const PaymentCardSchema = require('../models/payment_card')
const VoucherSchema = require('../models/voucher')

class UserController {
    async signUp(req, res) {
        const user = req.body

        const userModel = mongoose.model('user', UserSchema)

        await userModel.insertMany(user)

        const response = await userModel.findOne({
            uid: user.uid
        })

        res.json({
            "statusCode": 200,
            "data": response
        })
    }

    async signIn(req, res) {
        const uid = req.query.uid

        const userModel = mongoose.model('user', UserSchema)

        const response = await userModel.findOne({
            uid: uid
        })

        res.json({
            "statusCode": 200,
            "data": response
        })
    }

    async editProfile(req, res) {
        const user = req.body

        const userModel = mongoose.model('user', UserSchema)

        const response = await userModel.findOneAndUpdate(
            { uid: user.uid },
            user,
            { returnOriginal: false }
        )

        res.json({
            "statusCode": 200,
            "data": response
        })
    }

    async addPaymentCard(req, res) {
        const { uid, card } = req.body

        const userModel = mongoose.model('user', UserSchema)

        const response = await userModel.findOneAndUpdate(
            { uid: uid },
            { $push: { paymentCards: card } },
            { new: true }
        )

        res.json({
            "statusCode": 200,
            "data": response.paymentCards
        })
    }

    async deletePaymentCard(req, res) {
        const { uid, id } = req.body

        const userModel = mongoose.model('user', UserSchema)

        const response = await userModel.findOneAndUpdate(
            { uid: uid },
            { $pull: { paymentCards: { _id: id } } },
            { new: true }
        )

        res.json({
            "statusCode": 200,
            "data": 'success'
        })
    }

    async addTicket(ticketId, uid) {
        const userModel = mongoose.model('user', UserSchema)

        const response = await userModel.findOneAndUpdate(
            { uid: uid },
            { $push: { tickets: ticketId } },
            { new: true }
        )

        console.log(response)

    }

    async getVoucher(req, res) {
        const uid = req.query.uid

        const voucherModel = mongoose.model('voucher', VoucherSchema)

        const response = await voucherModel.find({ listUidUsed: { $ne: uid } })
            .select('-listUidUsed')

        res.json({
            "statusCode": 200,
            "data": response
        })
    }

    async removeVoucher(voucherId, uid) {
        const voucherModel = mongoose.model('voucher', VoucherSchema)

        await voucherModel.findOneAndUpdate(
            { _id: voucherId },
            { $push: { listUidUsed: uid } },
        )
    }
}

module.exports = new UserController()