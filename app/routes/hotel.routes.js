var express = require('express');
var router = express.Router();
var hotelCtrl = require('../controller/hotel.controller');

router.route('/hotels').get(hotelCtrl.getAllHotels);

router.route('/hotels/:hotelId').get(hotelCtrl.getOneHotel);

router.route('/hotels/:hotelId/:userId').post(hotelCtrl.bookHotel);

module.exports = router;
