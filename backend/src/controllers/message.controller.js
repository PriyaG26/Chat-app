import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => { 
    //Purpose: to get all the other users on the sidebar except ourselves
  try {
    const loggedInUserId = req.user._id; //we can get this as this method is protected under protectRoutes
    //returns all the users where the returned user id not equal to ($ne) the logged in user
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
    //purpose: to get all the messages exchanged between me and other person when i open a their chat
  try {
    //reciever id
    const { id: userToChatId } = req.params; //in the routes, we are using :id in the url we are using "id" here. we are renaming it to userToChatId

    //sender id
    const myId = req.user._id;

    const messages = await Message.find({
        //find all the messages where i am sender and xyz is reciever or vv. We use an array for all the conditions that we wanna apply
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    //return all the messages
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body; //message could be a text or image or both
    const { id: receiverId } = req.params; //getting the id and renaming it ot reciever id
    const senderId = req.user._id;

    let imageUrl;
    if (image) { //if image is passed
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    //create the new message in db
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, // this value will be stored as undefined if no image is provided
    });

    await newMessage.save(); //whenever we send a msg, we save it to DB and send it to user in real time

    //functionality of sending messages in real time
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) { //if user is online, send the message in real time
      io.to(receiverSocketId).emit("newMessage", newMessage); //we use io.to bcz io.emit broadcasts it to everyone
    }

    //new message has been created and send the message back to the client as well
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};