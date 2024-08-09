const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_USERDB_CONNECTION_STRING).then(console.log("connect to db google"));

const userSchema = mongoose.Schema({
    userName: String,
    googleId: String,
})

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;