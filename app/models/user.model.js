var mongoose = require('mongoose');

var bookingHistorySchema = mongoose.Schema({
  userName: String,
  emailId: String,
  phNo: String,
  hotelName: String,
  bookingDate: Date,
  price: String,
  hotelId: String,
  noOfRooms: Number,
  currency: String,
});

var userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
  },
  role: String,
  isActive: {
    type: Boolean,
    required: true,
  },
  bookingHistory: [bookingHistorySchema],
  phoneNumber: String,
});

module.exports = mongoose.model('User', userSchema, 'users');
