const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  area: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  images: [String], // Array to store image URLs
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type:{
    type: String
  }
});

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
