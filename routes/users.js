const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");


mongoose.connect("mongodb://127.0.0.1:27017/pinterest")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  profileImage: {
    type: String, // You might want to store the URL or file path of the profile picture
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  contact: {
    type: Number,
    required: true,
    trim: true,
  },
  boards: {
    type: Array,
    default: []
  },
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
