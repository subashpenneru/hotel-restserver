var express = require('express');
var router = express.Router();
var hotelCtrl = require('../controller/hotel.controller');
var userCtrl = require('../controller/user.controller');

router.route('/hotels')
.get(userCtrl.tokenValidator, hotelCtrl.getAllHotels)

router.route('/hotels/:hotelId')
.get(userCtrl.tokenValidator, hotelCtrl.getOneHotel);

router.route('/hotels/:hotelId/:userId')
.post(hotelCtrl.bookHotel);

module.exports = router;