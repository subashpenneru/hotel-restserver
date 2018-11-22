var express = require('express');
var router = express.Router();
var userCtrl = require('../controller/user.controller');

router.route('/user/register').post(userCtrl.register);
router.route('/user/login').post(userCtrl.login);

module.exports = router;