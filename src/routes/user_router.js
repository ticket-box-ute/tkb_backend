const express = require('express')
const router = express.Router()
const userController = require('../controllers/user_controller')

router.post('/sign_up', userController.signUp)

router.get('/sign_in', userController.signIn)

router.post('/edit_profile', userController.editProfile)

router.post('/add_payment_card', userController.addPaymentCard)

router.post('/delete_payment_card', userController.deletePaymentCard)

router.get('/vouchers', userController.getVoucher)

module.exports = router