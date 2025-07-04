import mongoose from "mongoose";

//schema for messages 
const messageSchema = new mongoose.Schema(
  {
    senderId: { //reference to the user model
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", 
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;