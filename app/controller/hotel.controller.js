const moment = require('moment-timezone');
const Hotel = require('../models/hotel.model');
const User = require('../models/user.model');

const getAllHotels = async (req, res, next) => {
  const { city } = req.query;

  const hotels = await Hotel.find({});

  if (hotels && hotels.length > 0) {
    if (city) {
      const response = hotels.filter(({ location }) =>
        location && location.address && location.address.includes(city)
          ? true
          : false
      );

      res.json({ hotels: response, totalRecords: response.length });
    } else {
      res.json({ hotels: hotels, totalRecords: hotels.length });
    }
  } else {
    res.status(404).json({
      message: 'No Hotels Found',
    });
  }
};

const getOneHotel = async (req, res, next) => {
  const { hotelId } = req.params;

  if (hotelId) {
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      res.status(404).json({ message: 'No Hotel Found!' });
    }

    res.json(hotel);
  } else {
    res.status(500).json({
      message: 'Id not Found',
    });
  }
};

const bookHotel = async (req, res, next) => {
  const { hotelId, userId } = req.params;
  const { userName, email, mobile, roomNumber } = req.body;
  const roomNo = roomNumber
    ? Number(roomNumber) >= 0
      ? Number(roomNumber)
      : 0
    : 0;

  const { hotel, user } = await findOneHotelOneUser(hotelId, userId);

  if (user._id) {
    const response = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          bookingHistory: {
            userName,
            emailId: email,
            phNo: mobile,
            hotelName: hotel.name,
            bookingDate: moment.utc().format(),
            price: hotel.rooms[Number(roomNo)].price,
          },
        },
      },
      { new: true }
    );

    if (!response) {
      res.status(500).json({
        message: 'Booking is not completed due to server error',
      });
    }

    res.json({ message: 'Booking Completed!', result: response });
  } else {
    res.status(404).json({
      message: 'user not found for booking',
    });
  }
};

async function findOneHotelOneUser(hotelId, userId) {
  if (!hotelId) throw new Error('Hotel Id not Found');
  if (!userId) throw new Error('user Id not Found');

  const hotel = await Hotel.findById(hotelId);
  const user = await User.findById(userId);

  return {
    hotel,
    user,
  };
}

module.exports = { getAllHotels, getOneHotel, bookHotel };
