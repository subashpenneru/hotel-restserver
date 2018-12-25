var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel')
var User = mongoose.model('User');

module.exports.getAllHotels = (req,res,next)=>{
    
    Hotel.find().exec((error,response)=>{
        if(error) {
            res.status(404).set('application/json')
            .json({
                message:"Hotels Record not found"
            });
        }
        else {
            let requiredHotels = [];
            var city = {
                hotels: requiredHotels
            }
            if(req.query && req.query.city) {
                for(h of response) {
                    if(h.location.address.includes(req.query.city)) {
                        requiredHotels.push(h);
                    }
                }
                if(requiredHotels.length>0) {
                    res.status(200).set('application/json')
                    .json(city);
                }
                else {
                    res.status(404).set('application/json')
                    .json({
                        message:"No Hotels Found"
                    })
                }
            }
            else {
                res.status(200).set('application/json')
                .json(response);
            }
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

module.exports.bookHotel = (req,res,next)=>{
    hotelId = req.params.hotelId;
    userId = req.params.userId;
    
    findOneHotelOneUser(hotelId, userId).then(data=>{

        if(data.user._id) {
            User.findOneAndUpdate({_id:data.user._id}, {$push: {bookingHistory: {
                    userName: req.body.userName,
                    emailId: req.body.email,
                    phNo: req.body.mobile,
                    hotelName: data.hotel.name,
                    bookingDate: new Date(),
                    price: data.hotel.rooms[0].price
                }}}, {new:true}, (err,doc)=>{
                if(err) {
                    res.status(500).set('application/json')
                    .json({
                        error:err,
                        message: "Booking is not completed due to server error"
                    });
                }
                else {
                    res.status(200).set('application/json')
                    .json({
                        response: true,
                        result: doc,
                        message: "Booking Completed !"
                    });
                }
            });
        }
        else {
            res.status(404).set('application/json')
            .json({
                message: "user not found for booking"
            });
        }
    }).catch(error=>{

    })
}

async function findOneHotelOneUser(hotelId, userId){
    if(!hotelId) throw new Error("Hotel Id not Found");
    if(!userId) throw new Error("user Id not Found");

    var hotel = await Hotel.findById(hotelId);
    var user = await User.findById(userId);

    return {
        hotel: hotel,
        user: user
    };
}