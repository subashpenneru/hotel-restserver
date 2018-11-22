var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    firstname:String,
    lastname:String,
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});

mongoose.model('User',userSchema,'users');