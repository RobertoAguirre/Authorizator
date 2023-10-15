const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const userSchema = new mongoose.Schema({

        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true
        },
        username: {
            type: String,
            required: [true, 'Please provide your username'],
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, 'Please provide your password'],
            minlength: 8
        },
        application: {
            type:String,
            required: [true, 'Please provide your application'],
        },
        role:{
            type: String,
            enum: ['readonly','user', 'admin', 'superadmin'],
            default: 'user'
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        lastLogin: {
            type: Date,
            default: Date.now()
        },
        accountStatus: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active'
        },
        profile: {
            firstName: String,
            lastName: String,
            phone1: String,
            phone2: String,
            address: String,
            address2: String,
            city: String,
            state: String,
            zip: String,
            country: String,
            image: String
        }

    },

);

module.exports = mongoose.model('User', userSchema);