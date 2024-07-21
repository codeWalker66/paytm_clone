require('dotenv').config

module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    mongoUrl: process.env.MONGODB_URL,
};