const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs");



const loginSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        required: true,

    },
    userName : {
         type: String,
        required: true, 
    },
  
  isPrimary: {
        type: Boolean
    },

    otp: {
        type: String,
    },
});

loginSchema.methods.hassPass = function (pass) {
    return bcrypt.hashSync(pass, bcrypt.genSaltSync(10))
};

loginSchema.methods.comPass = function (pass, hash) {
    return bcrypt.compareSync(pass, hash)
}

module.exports = mongoose.model('Login', loginSchema);
