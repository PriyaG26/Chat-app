import jwt from "jsonwebtoken";
import User from "../models/user.model.js"

//middleware is just like a =n added security layer to prevent loopholes.
//in this, we include "next" as well. if we know user is authenticated, the next function update profile will be called
export const protectRoute = async(req, res, next) => {
    try {
        //the first task is to check whether there exists a token or not
        const token = req.cookies.jwt //jwt is basically the name of the token generated at the time of signup. if it was named x, then i would have written x here

        if (!token){ //if no token exists
            return res.status(401).json({message:"Unauthorized - No Token provided"});
        }

        //we need to parse the cookie as it is not in understandable format and it might contain imp info like user id(bcz that is what we had put in as the payload whiloe generating token), so e=we need to retrieve that info
        //we take the current token and compare it with our jwt secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded){ 
            return res.status(401).json({message:"Unauthorized - Invalid Token"})
        }

        //if the current token matches the secret key, then find the user by user id (bcz we retrieved user if from token). Once the user is found, then select all the parameters excluding password (the query written below is for deselecting)
        const user = await User.findById(decoded.userId).select("-password") //it's not a good practice to return the password to the user, creates security concerns
        if(!user){
            return res.status(404).json({message: "User not found"})
        }

        //once user is foud=nd, add the user to the request and call next function
        req.user = user
        next()


    } catch (error) {
        console.log("Error in protective middleware: ",error.message);
        res.status(500).json({message:"Internal server error"})
        
    }
}