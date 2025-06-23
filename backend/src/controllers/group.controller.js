import Group from "../models/group.model.js";
// import User from "../models/user.model.js";


export const createGroup = async (req,res) => {
    try {
        const { groupName, members, admin } = req.body; // Corrected to groupName

        if (!groupName || !members || members.length === 0) {
            return res.status(400).json({ message: "Group name and at least one member are required" });
        }

        const group = await Group.create({
            groupName, // Corrected to groupName
            members: [...members, admin], // ensure admin is added to the group
            admin,
        });
 
        // IMPORTANT: If you want to use `addGroupToState`, the returned `group`
        // should have all the fields `Sidebar` expects (like `groupName`, `_id`).
        // You might want to populate members here if your frontend needs them immediately after creation.
        await group.populate('members', 'fullName profilePic'); // Example: Populate members for full group object

        res.status(201).json(group); // Send the created group object back
    } catch (err) {
        console.log("Error in create group controller: ", err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;

    const groups = await Group.find({ members: userId }).populate('members', 'fullName profilePic');

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};