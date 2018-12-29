require('./app/models/db.connect');
require('dotenv').config();

const CONFIG = require('./app/config/config')
var express = require('express');
var app = express();
var bodyparser = require('body-parser'); 
var fs = require('fs');
const log4js = require('log4js');

log4js.configure('./app/config/log4jsConf.json');
var startupLogger = log4js.getLogger('server');
var accessLogger = log4js.getLogger('http');

var userRoutes = require('./app/routes/user.routes');
var hotelRoutes = require('./app/routes/hotel.routes');

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use('/api/user/uploads', express.static('uploads'))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, x-access-token, user-access-token, Accept");
    next();
  });
  
try {
    fs.mkdirSync('./logs');
} catch (error) {
    if(error.code != 'EEXIST') {
        console.log('could not setup logs directory ',error);
        process.exit(1);
    }
}
app.use((req,res,next)=>{
    accessLogger.info(req.method+' == '+req.url);
    next();
})

app.use('/api',userRoutes);
app.use('/api',hotelRoutes);

app.listen(CONFIG.PORT,CONFIG.HOST,()=>{
    startupLogger.info(`Server is Running at http://${CONFIG.HOST}:${CONFIG.PORT}`);
    
})