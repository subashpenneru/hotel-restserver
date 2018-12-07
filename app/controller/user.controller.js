var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const CONFIG = require('../config/config');
const multer = require('multer');


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

        var user = new User({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            password:hashPwd,
            userImage:req.file.path,
            role:req.body.role
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
                var isPwd = bcrypt.compareSync(req.body.password,user.password);
                if(isPwd) {
                    var token = jwt.sign({_id:user._id},CONFIG.SECRETKEY,{expiresIn:"24h"})
                    res.status(200).set('application/json')
                    .json({
                        auth:true,
                        message:"Login Successfull",
                        token:token,
                        user:user
                    })
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