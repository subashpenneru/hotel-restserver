require('./app/models/db.connect');

const CONFIG = require('./app/config/config')
var express = require('express');
var app = express();
var bodyparser = require('body-parser'); 
var userRoutes = require('./app/routes/user.routes');
var hotelRoutes = require('./app/routes/hotel.routes');

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use('/api/user/uploads', express.static('uploads'))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, x-access-token, Accept");
    next();
  });
  
app.use((req,res,next)=>{
    console.log(req.method +" == "+req.url);
    next();
})

app.use('/api',userRoutes);
app.use('/api',hotelRoutes);

app.listen(CONFIG.PORT,CONFIG.HOST,()=>{
    console.log(`Server is Running at http://${CONFIG.HOST}:${CONFIG.PORT}`);
    
})