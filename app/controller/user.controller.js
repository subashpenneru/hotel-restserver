var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const CONFIG = require('../config/config');
const multer = require('multer');
var nodemailer = require('nodemailer');

// OTPLIB
var otplib = require('otplib');

// SENDOTP ACCOUNT
const Sendotp = require('sendotp');
const sendOtp = new Sendotp('254044A0l4DbFs5c270278'); 

// TWILIO ACCOUNT
const accSid = process.env.TWILIO_ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accSid,authToken);

// SEND SMS USING SPRINGEDGE.......
/* var springedge = require('springedge');
var params = {
    "apikey": "6u69665t3171ar1eqlberiv452ozenafh",
    "sender": "SEDEMO",
    "to": [
        "917095692523"
    ],
    "message": "test+message",
    "format": "json"
}; */

var User = mongoose.model('User');

module.exports.register = (req,res,next)=>{
    if(req.body && req.body.firstname && req.body.email && req.body.password) {
        console.log(req.body);
        if(req.body.userImage == 'null') {
            req.file = {
                fieldname: 'userImage',
                originalname: 'khaleesi.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: './uploads',
                filename: 'khaleesi.jpg',
                path: 'uploads/khaleesi.jpg',
                size: 73151
            }
        }
        
        const saltRounds = 10;
        var salt = bcrypt.genSaltSync(saltRounds);
        var hashPwd = bcrypt.hashSync(req.body.password,salt);
        var isUserActive = false
        var user = new User({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            password:hashPwd,
            userImage:req.file.path,
            role:req.body.role,
            isActive:isUserActive
        });
        
        user.save((err,user)=>{
            if(err) {
                res.status(500).set('application/json')
                .json({
                    error:err,
                    message:"Failed to register a user"
                });
            }
            else {
                var token = jwt.sign({_id:user._id},CONFIG.SECRETKEY,{expiresIn:"24h"});
                res.status(200).set('application/json')
                .json({
                    auth:true,
                    message:"user registration successfull",
                    token:token
                });
                var transporter = nodemailer.createTransport({
                    service: "gmail",
                    secure: false,
                    port: 25,
                    auth: {
                        user: CONFIG.mailUser,
                        pass: CONFIG.mailPass
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                var mailOptions = {
                    from: CONFIG.mailUser,
                    to: req.body.email,
                    subject: "Welcome to Hotel! Confirm your mail to continue",
                    html: `<h1>Welcome to MyHotel</h1>
                        <p>confirm your mail <a href="http://localhost:4200/confirmMail?emailId=${user._id}">by clicking this link</a></p>
                        <p>This is the best website to book a hotel at low prizes</p>`
                };

                transporter.sendMail(mailOptions, (error, info)=>{
                    if(error) {
                        console.log(error);
                        
                    }
                    else {
                        console.log("Email Sent: "+ info.response);
                        
                    }
                });
            }
        })
    }
    else {
        res.status(404).set('application/json')
        .json({
            message:"Required fields are missing"
        });
    }
}

module.exports.login = (req,res,next)=>{
    if(req.body && req.body.email && req.body.password) {
        User.findOne({email:req.body.email},(error,user)=>{
            if(error) {
                res.status(500).set('application/json')
                .json({
                    error:error,
                    message:"Failed to find a user"
                });
            }
            else if(!user) {
                res.status(404).set('application/json')
                .json({
                    error:error,
                    message:"User not found get Registered"
                });
            }
            else {
                const otpToken = otplib.authenticator.generate(process.env.SECRET_KET_OTP);

                var isPwd = bcrypt.compareSync(req.body.password,user.password);
                if(isPwd) {
                    if(user.isActive) {
                        var token = jwt.sign({_id:user._id},CONFIG.SECRETKEY,{expiresIn:"24h"})
                        res.status(200).set('application/json')
                        .json({
                            auth:true,
                            message:"Login Successfull",
                            token:token,
                            user:user
                        });

                        /* springedge.messages.send(params,5000,(err,resp)=>{
                            if(err) {
                                console.log(err);
                                
                            }
                            console.log(resp);
                            
                        }); */

                        // SMS SEND USING TWILIO
                        client.messages.create({
                            to: process.env.MY_PHONE_NUM,
                            from: '+18507907398',
                            body: `first sms from my node js project - SUBASH OTP--${otpToken}`
                        });

                        // SEND OTP USING SENDOTP
                        sendOtp.send(process.env.MY_PHONE_NUM, "SHOTEL", (err,data)=>{
                            if(err) {
                                console.log(err);
                            }
                            else {
                                console.log(data);
                            } 
                        });
                    }
                    else {
                        res.status(500).set('application/json')
                        .json({
                            message:"please confirm your account to Login"
                        })
                    } 
                }
                else {
                    res.status(500).set('application/json')
                    .json({
                        error:error,
                        message:"Enter correct password"
                    })
                }
            }
        })
    }
    else {
        res.status(404).set('application/json')
        .json({
            message:"Required fields are missing"
        });
    }
}

module.exports.tokenValidator = (req,res,next)=>{
    var token = req.headers['x-access-token'];
    if(!token) {
        res.status(404).set('application/json')
        .json({
            auth:false,
            token:null,
            message:"Failed to authenticate, Token not Found"
        });
    }
    else {
        jwt.verify(token,CONFIG.SECRETKEY,(error,doc)=>{
            if(error) {
                res.status(401).set('application/json')
                .json({
                    error:error,
                    message:"Failed to authenticate, Unauthorized token"
                });
            }
            else {
                User.findById(doc._id).exec((error,user)=>{
                    if(error) {
                        res.status(500).set('application/json')
                        .json({
                            error:error,
                            message:"Failed to find a user via token"
                        })
                    }
                    else if(!user) {
                        res.status(404).set('application/json')
                        .json({
                            error:error,
                            message:"User not found via token id"
                        })
                    }
                    else {
                        next();
                    }
                });
            }
        });
    }
}

module.exports.storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

module.exports.fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

module.exports.updateUser = (req,res,next)=>{
    if(req.params.userId) {
        console.log(req.body)
        if(typeof req.body.userImage == 'string') {
            oName = req.body.userImage.split('/');
            req.file = {
                fieldname: 'userImage',
                originalname: oName[1],
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: './uploads',
                filename: '2018-12-02T02:16:06.010Zkhaleesi.jpg',
                path: req.body.userImage,
                size: 73151
            }
        }

        User.findByIdAndUpdate(req.params.userId,{
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            userImage:req.file.path
        },(error,response)=>{
            if(error) {
                res.status(500).set('application/json')
                .json({
                    error:error
                });
            }
            else {
                res.status(200).set('application/json')
                .json(response)
            }
        });
    }
    else {
        res.status(500).set('application/json')
        .json({
            message:"required fields are missing"
        });
    }
}

module.exports.getImage = (req,res,next)=>{
    userId = req.params.userId;

    User.findById(userId,(error,response)=>{
        if(error) {
            res.status(500).set('application/json')
                .json({
                    error:error
                });
        }
        else {
            res.status(200).set('application/json')
            .json(response.userImage)
        }
    });
}

module.exports.updateRegUser = (req,res,next)=>{
    console.log(req.body.isActive);
    
    User.findByIdAndUpdate(req.query.emailId, {
        isActive: req.body.isActive
    },(error,resp)=>{
        if(error) {
            res.status(500).set('application/json')
            .json({
                error:error,
            });
        }
        else {
            res.status(200).set('application/json')
            .json({
                response:resp,
            });
        }
    });
}

module.exports.tokenValidation = (req,res,next)=>{
    var token = req.headers['user-access-token'];
    if(!token) {
        res.status(404).set('application/json')
        .json({
            auth:false,
            token:null,
            message:"Failed to authenticate, Token not Found"
        });
    }
    else {
        jwt.verify(token,CONFIG.SECRETKEY,(error,doc)=>{
            if(error) {
                res.status(401).set('application/json')
                .json({
                    error:error,
                    message:"Failed to authenticate, Unauthorized token"
                });
            }
            else {
                User.findById(doc._id).exec((error,user)=>{
                    if(error) {
                        res.status(500).set('application/json')
                        .json({
                            error:error,
                            message:"Failed to find a user via token"
                        })
                    }
                    else if(!user) {
                        res.status(404).set('application/json')
                        .json({
                            error:error,
                            message:"User not found via token id"
                        })
                    }
                    else {
                       res.status(200).set('application/json')
                       .json(user)
                    }
                });
            }
        });
    }
}