const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    trim: true,
  },
 Members:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
 }],
 CreatedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
 },
 Messages:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Message"
 }],
 Location:{
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
 },
 isPrivate:{
  type:Boolean,
  required:true
 },
 Password:{
  type:String
 },
 Area:{
   type:String,
   required:true
 }

},{timestamps:true});

roomSchema.index({ Location: "2dsphere" });

module.exports = mongoose.model("Room", roomSchema);
