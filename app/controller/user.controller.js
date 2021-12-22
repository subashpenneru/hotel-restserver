const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CONFIG = require('../config/config');
const multer = require('multer');

// OTPLIB
var otplib = require('otplib');

// SENDOTP ACCOUNT
const Sendotp = require('sendotp');
const sendOtp = new Sendotp('254044A0l4DbFs5c270278');

// TWILIO ACCOUNT
const accSid = process.env.TWILIO_ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accSid, authToken);

const User = require('../models/user.model');

module.exports.register = async (req, res, next) => {
  const { firstname, lastname, email, password, userImage, role } = req.body;

  if (!(firstname && email && password)) {
    return res.status(404).json({
      message: 'Required fields are missing',
    });
  }

  if (userImage == 'undefined') {
    req.file = {
      fieldname: 'userImage',
      originalname: 'khaleesi.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: './uploads',
      filename: 'khaleesi.jpg',
      path: 'uploads/khaleesi.jpg',
      size: 73151,
    };
  }

  const salt = await bcrypt.genSalt(10);
  const hashPwd = await bcrypt.hash(password, salt);

  const existingUser = await User.find({ email });

  if (existingUser) {
    return res.status(404).json({
      message: `Already user exists with email: ${email}, Please login`,
    });
  }

  const user = new User({
    firstname,
    lastname,
    email,
    password: hashPwd,
    userImage: req.file.path,
    role,
    isActive: true,
  });

  const reqUser = await user.save();

  res.status(201).json({
    user: reqUser,
    token: generateToken(reqUser),
    auth: true,
  });
};

const generateToken = (user) =>
  jwt.sign({ _id: user._id }, CONFIG.SECRETKEY, { expiresIn: '24h' });

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    return res.status(404).json({
      message: 'Required fields are missing',
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: 'User not found please Register',
    });
  }

  const isPwd = await bcrypt.compare(password, user.password);

  if (!isPwd) {
    return res.status(401).json({
      message: 'Enter correct password',
    });
  }

  res.json({
    auth: true,
    token: generateToken(user),
    user,
  });
};

module.exports.tokenValidator = async (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(404).json({
      auth: false,
      token: null,
      message: 'Failed to authenticate, Token not Found',
    });
  }

  const doc = jwt.verify(token, CONFIG.SECRETKEY);

  if (!doc) {
    return res.status(401).json({
      message: 'Failed to authenticate, Unauthorized token',
    });
  }

  const user = await User.findById(doc._id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found via token id',
    });
  }

  next();
};

module.exports.storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

module.exports.fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports.updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { firstname, lastname, phoneNumber } = req.body;

  if (!userId) {
    res.status(404).json({
      message: 'required fields are missing',
    });
  }

  const obj = { firstname, lastname, phoneNumber };

  if (req.file?.path) {
    obj.userImage = req.file.path;
  }

  const user = await User.findByIdAndUpdate(userId, obj, { new: true });

  res.json(user);
};

module.exports.getImage = async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found!' });
  }

  res.json(user.userImage);
};

module.exports.updateRegUser = async (req, res, next) => {
  const { emailId } = req.query;
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(emailId, { isActive });

  if (!user) {
    return res.status(404).json({ error: 'User Not found' });
  }

  return res.status(200).json({
    response: user,
  });
};

module.exports.tokenValidation = (req, res, next) => {
  var token = req.headers['user-access-token'];
  if (!token) {
    res.status(404).set('application/json').json({
      auth: false,
      token: null,
      message: 'Failed to authenticate, Token not Found',
    });
  } else {
    jwt.verify(token, CONFIG.SECRETKEY, (error, doc) => {
      if (error) {
        res.status(401).set('application/json').json({
          error: error,
          message: 'Failed to authenticate, Unauthorized token',
        });
      } else {
        User.findById(doc._id).exec((error, user) => {
          if (error) {
            res.status(500).set('application/json').json({
              error: error,
              message: 'Failed to find a user via token',
            });
          } else if (!user) {
            res.status(404).set('application/json').json({
              error: error,
              message: 'User not found via token id',
            });
          } else {
            res.status(200).set('application/json').json(user);
          }
        });
      }
    });
  }
};

module.exports.loginViaOtp = (req, res, next) => {
  sendOtp.send(req.body.phoneNumber, 'SHOTEL', (err, data) => {
    if (err) console.log(err);
    else {
      sendOtp.setOtpExpiry('5');
      res.status(200).set('application/json').json({
        result: true,
        data: data,
      });
    }
  });
};

module.exports.viaOTP = (req, res, next) => {
  sendOtp.verify(req.body.phoneNumber, req.body.otp, (error, data) => {
    if (error) {
      res.status(500).set('application/json').json({
        error: error,
      });
    } else {
      if (data.type == 'success') {
        User.findOne({ phoneNumber: req.body.phoneNumber }, (error, respo) => {
          if (error) {
            res.status(500).set('application/json').json({
              error: error,
            });
          } else if (!respo) {
            res.status(404).set('application/json').json({
              message: 'No user found',
            });
          } else {
            var token = jwt.sign({ _id: respo._id }, CONFIG.SECRETKEY, {
              expiresIn: '24h',
            });
            res.status(200).set('application/json').json({
              auth: true,
              message: 'Login Successfull',
              token: token,
              user: respo,
            });
          }
        });
      } else {
        res.status(404).set('application/json').json({
          message: 'Wrong otp please try again',
        });
      }
    }
  });
};
