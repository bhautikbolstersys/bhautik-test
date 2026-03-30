const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

    otp: {
        type: String,
        default: null
    },

    isVerified: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    versionKey: false,
})

const User = mongoose.model('User', userSchema, 'User');
module.exports = User;