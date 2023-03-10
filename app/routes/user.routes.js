var express = require('express');
var router = express.Router();
var userCtrl = require('../controller/user.controller');

const multer = require('multer');

const upload = multer({
  storage: userCtrl.storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: userCtrl.fileFilter,
});

router
  .route('/user/register')
  .post(upload.single('userImage'), userCtrl.register);

router.route('/user/login').post(userCtrl.login);

router
  .route('/user/login/mobile')
  .post(userCtrl.loginViaOtp)
  .put(userCtrl.viaOTP);

router
  .route('/user/:userId')
  .get(userCtrl.getImage)
  .post(upload.single('userImage'), userCtrl.updateUser);

router
  .route('/user')
  .post(userCtrl.updateRegUser)
  .get(userCtrl.tokenValidation);

module.exports = router;
