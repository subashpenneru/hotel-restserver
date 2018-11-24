var mongoose = require('mongoose');
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

module.exports.getOneHotel = (req,res,next)=>{
    if(req.params && req.params.hotelId) {
        Hotel.findById(req.params.hotelId).exec((error,hotel)=>{
            if(error) {
                res.status(404).set('application/json')
                .json({
                    error:error,
                    message:"Internal error"
                });
            }
            else if(!hotel) {
                res.status(401).set('application/json')
                .json({
                    message:"Hotel records not found"
                });
            }
            else {
                res.status(200).set('application/json')
                .json(hotel);
            }
        });
    }
    else {
        res.status(500).set('appliaction/json')
        .json({
            message:"Id not Found"
        })
    }
}