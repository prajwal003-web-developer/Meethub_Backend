const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
    trim: true,
  },
  Password: {
    type: String,
    required: true,
  },
  ActiveGroups:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Room"
  }]
},{timestamps:true});

module.exports = mongoose.model("User", userSchema);
