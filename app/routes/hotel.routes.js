var express = require('express');
var router = express.Router();
var hotelCtrl = require('../controller/hotel.controller');

router.route('/hotels').get(hotelCtrl.getAllHotels);

module.exports = router;