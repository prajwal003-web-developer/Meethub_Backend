const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    Text:{
        required:true,
        type:String
    },
    SentBy:{
        required:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    Room:{
        required:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:"Room"
    }
},{timestamps:true});

module.exports = mongoose.model("Message", messageSchema);
