//A schema for storing user data
import mongoose from "mongoose";

//calling the mongoose function 
const userSchema = new mongoose.Schema(
  { //this is an object and contains details of all the fields that a user would need
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    lastSeen: {
    type: Date,
    default: null,
  },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;