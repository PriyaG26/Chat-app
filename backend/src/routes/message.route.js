import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

//get all the users
router.get("/users", protectRoute, getUsersForSidebar); //we use get method so that we can get users on the sidebar

//retrieve all the messages of the user whose chat is opened
router.get("/:id", protectRoute, getMessages);

//send message to the person with the id : XXXXXX
router.post("/send/:id", protectRoute, sendMessage); 

export default router;