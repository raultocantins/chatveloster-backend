  
const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
 name: String,
 email: String,
 pwd:String,
 nickname:String,
 url:String,
});

module.exports = mongoose.model("User", UserSchema);