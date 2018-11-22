var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const CONFIG = require('../config/config');

var User = mongoose.model('User');

module.exports.register = (req,res,next)=>{
    if(req.body && req.body.firstname && req.body.email && req.body.password) {

        const saltRounds = 10;
        var salt = bcrypt.genSaltSync(saltRounds);
        var hashPwd = bcrypt.hashSync(req.body.password,salt);

        var user = new User({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            password:hashPwd
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
                        token:token
                        // user:user
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