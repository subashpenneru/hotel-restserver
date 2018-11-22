var mongoose = require('mongoose');
const CONFIG = require('../config/config');
var Hotel = mongoose.model('Hotel')

module.exports.getAllHotels = (req,res,next)=>{
    
    Hotel.find().exec((error,response)=>{
        if(error) {
            res.status(404).set('application/json')
            .json({
                message:"Hotels Record not found"
            });
        }
        else {
            res.status(200).set('application/json')
            .json(response);
        }
    });
}