const mongoose = require('mongoose')

const {Schema} = mongoose;

const UserSchema = new Schema({
    prefix:{
        type: String,
        required: true
    },
    Fname:{
        type: String,
        required: true
    },
    Mname:{
        type: String,
        required: false
    },
    Lname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        // unique: true,
    },
    mobile:{
        type: Number,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    isVerified: { 
        type: Boolean, 
        required: true,
        default: false 
    },
    date:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('user',UserSchema)