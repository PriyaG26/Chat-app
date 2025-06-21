import express from "express"
import { login, logout, signup, updateProfile, checkAuth } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

//express is a middleware that provides a router, so as to allow the user to navigate through pages
const router = express.Router()

//imported from auth.controller.js in controllers so that files stay organised
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.put("/update-profile", protectRoute, updateProfile) //this allows the users to update their profile pic
//protect route is to check whether the user is authenticated. Both of the last 2 args are functions
//protect route is like a middle layer. If the user is authenticated, then only update profile will be called

//when user refreshes the page, we need to check if user is authenticated
router.get("/check", protectRoute, checkAuth)

export default router;