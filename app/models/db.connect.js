const CONFIG = require('../config/config.js')
const mongoose = require('mongoose');
require('./user.model.js');
require('./hotel.model');

const log4js = require('log4js');
const log4jsConf = require('../config/log4jsConf.json');
log4js.configure(log4jsConf);
var dbLogger = log4js.getLogger('db');

var options = {
    user : CONFIG.DBUSER,
    pass:CONFIG.dbPass,
    authSource:CONFIG.AUTHSOURCE,
    useNewUrlParser: true
}

mongoose.connect(CONFIG.DBURL,options);
var db = mongoose.connection;
db.on('error',(err)=>{
    dbLogger.info("DB Connection Failed via Mongoose");
    console.log(err);
    
})
db.once('open',()=>{
    dbLogger.info("DB Connection Successfull via Mongoose");
    console.log("DB Connection Successfull via Mongoose");
      
})
