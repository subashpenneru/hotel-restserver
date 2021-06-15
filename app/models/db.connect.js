const mongoose = require('mongoose');
const config = require('../config/config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.DBURL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (e) {
    console.error(`Error: ${e.message}`.red.underline.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
