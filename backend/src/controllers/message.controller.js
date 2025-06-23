import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";


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
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id; // Current authenticated user

        const conversation = await Message.find({
            $or: [
                { senderId: senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId },
            ],
        })
            .sort({ createdAt: 1 }) // Sort by oldest to newest
            .populate('senderId', 'fullName profilePic') // Populate sender
            .populate('receiverId', 'fullName profilePic') // Populate receiver
            .lean(); // Use .lean()

        res.status(200).json(conversation);
    } catch (error) {
        console.error("Error in getMessages controller (direct):", error.message);
        res.status(500).json({ message: "Server error." });
    }
};


// export const getMessages = async (req, res) => {
//     //purpose: to get all the messages exchanged between me and other person when i open a their chat
//   try {
//     //reciever id
//     const { id: userToChatId } = req.params; //in the routes, we are using :id in the url we are using "id" here. we are renaming it to userToChatId

//     //sender id
//     const myId = req.user._id;

//     const messages = await Message.find({
//         //find all the messages where i am sender and xyz is reciever or vv. We use an array for all the conditions that we wanna apply
//       $or: [
//         { senderId: myId, receiverId: userToChatId },
//         { senderId: userToChatId, receiverId: myId },
//       ],
//     });

//     //return all the messages
//     res.status(200).json(messages);
//   } catch (error) {
//     console.log("Error in getMessages controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


export const sendMessageToGroup = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { groupId } = req.params;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ message: "Message content cannot be empty." });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }
        if (!group.members.includes(senderId)) {
            return res.status(403).json({ message: "You are not a member of this group." });
        }

        const newMessage = new Message({
            senderId: senderId,
            groupId: groupId,
            // receiverId: undefined, // Explicitly set for clarity, though not strictly needed if schema handles it
            text: text,
            image: image,
        });

        await newMessage.save();

        // Populate sender details for the response and for socket emission
        await newMessage.populate('senderId', 'fullName profilePic');
        // await newMessage.populate('groupId', 'groupName'); // Optional: populate group if needed on frontend for socket updates

        // Socket: Emit the new message to the specific group room
        // Make sure your socket.js sets up rooms for group IDs
        io.to(groupId).emit("newMessage", newMessage);

        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Error in sendMessageToGroup controller:", error.message);
        res.status(500).json({ message: "Server error." });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const senderId = req.user._id; // Current authenticated user

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }

        // Optional: Ensure the current user is a member of the group to view messages
        if (!group.members.includes(senderId)) {
            return res.status(403).json({ message: "You are not a member of this group." });
        }

        const messages = await Message.find({ groupId })
            .sort({ createdAt: 1 }) // Sort by oldest to newest
            .populate('senderId', 'fullName profilePic') // Always populate sender for consistency
            .lean(); // Use .lean() for plain JS objects, can be faster for reads

        res.status(200).json(messages);

    } catch (error) {
        console.error("Error in getGroupMessages controller:", error.message);
        res.status(500).json({ message: "Server error." });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const { text, image } = req.body;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ message: "Message content cannot be empty." });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image,
        });

        await newMessage.save();

        // Populate sender/receiver for real-time updates and response
        await newMessage.populate('senderId', 'fullName profilePic');
        await newMessage.populate('receiverId', 'fullName profilePic');

        // Socket logic for direct messages
        const receiverSocket = getReceiverSocketId(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit("newMessage", newMessage);
        }
        const senderSocket = getReceiverSocketId(senderId);
        if (senderSocket && senderSocket !== receiverSocket) { // Avoid double emitting if sender is receiver
             io.to(senderSocket).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Error in sendMessage controller (direct):", error.message);
        res.status(500).json({ message: "Server error." });
    }
};

// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body; //message could be a text or image or both
//     const { id: receiverId } = req.params; //getting the id and renaming it ot reciever id
//     const senderId = req.user._id;

//     let imageUrl;
//     if (image) { //if image is passed
//       // Upload base64 image to cloudinary
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }

//     //create the new message in db
//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       text,
//       image: imageUrl, // this value will be stored as undefined if no image is provided
//     });

//     await newMessage.save(); //whenever we send a msg, we save it to DB and send it to user in real time

//     //functionality of sending messages in real time
//     const receiverSocketId = getReceiverSocketId(receiverId);
//     if (receiverSocketId) { //if user is online, send the message in real time
//       io.to(receiverSocketId).emit("newMessage", newMessage); //we use io.to bcz io.emit broadcasts it to everyone
//     }

//     //new message has been created and send the message back to the client as well
//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.log("Error in sendMessage controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

