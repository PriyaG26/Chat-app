import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
  groupName: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  isGroup: { type: Boolean, default: true },
  groupImage: { type: String }, // optional
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
