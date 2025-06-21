import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async(req,res) => {
    const { fullName, email, password } = req.body; //the take content from the fields in the body ans store in the given var
    //signup the users, hash their passwords and create a token to let them know they're authenticated
    try {
        if (!fullName || !email || !password){
          return res.status(400).json({message: "All fields are required"});
        }

         if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" }); //status 400 means error message
    }

    //if pwd length is more than or equal to 6, then find a user with the entered email
     const user = await User.findOne({ email });

    //if the email exists, it means the current user cannot signup with the entered mail, so that need to change it or go to login page
     if (user) return res.status(400).json({ message: "Email already exists" });

    //if the email doesn't already exists, we generate a salt to crypt the password using bcrypt
    const salt = await bcrypt.genSalt(10); //the crypted password generated will be of length 10
    const hashedPassword = await bcrypt.hash(password, salt);

    //now since we know that the user is not registered earlier, we can create a user in the database
     const newUser = new User({
      fullName, //we are storing the fullname of the user as it is, therefore the shorter version of fullname:fullname is just fullname
      email,
      password: hashedPassword, //since the password given by the user and the one we are storing is different, so we have to use this convention
    });


    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res); //gives the user __id (that's how mongo stores user ids) and the response generated is sent back in res 
      await newUser.save(); //save the user to DB

      res.status(201).json({ //success msg
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
        
    } catch (error) {
         console.log("Error in signup controller", error.message); //for our debug purpose
         res.status(500).json({ message: "Internal Server Error" }); // 500: server error, to show to users
    }
};

export const login = async(req,res) => {
  const { email,password } = req.body
    try {
      if(!email || !password){
        return res.status(400).json({message: "All fields are required"});
      }

      const user = await User.findOne({email}) //try to find if the email exists

      if(!user){ 
        //if user is not found, then return with the status code 400 and return the message
        return res.status(400).json({message:"Invalid Credentials"})
      }

      //if user is found, we need to check if the password entered is correct. Since the password is encrypted, we need to first decrypt it
      const isPasswordCorrect = await bcrypt.compare(password, user.password)
      if (!isPasswordCorrect){
        return res.status(400).json({message: "Invalid credentials"})
      }

      generateToken(user._id, res)
      res.status(200).json({
        _id:user._id,
        fullname:user.fullname,
        email: user.email,
        profilePic: user.profilePic,
      })

    } catch (error) {
      console.log("Error in login controller", error.message);
      res.status(500).json({message: "Internal server error"})
      
    }
};

export const logout = (req,res) => {
    //the main thing we have to do is clear all the cookies that keep the user logged in 
    try {
      res.cookie("jwt", "", {maxAge: 0}) //replace the current cookie jwt with "" (empty string to remove the token) which expires immediately
      res.status(200).json({message: "Logged out Successfully"});
    } catch (error) {
      console.log("Error in logout controller", error.message);
      res.status(400).json({message:"Internal Server Error"});
      
    }
};

//in order to upload image, we need to have cloudinary
export const updateProfile = async(req,res) => {
  try {
    const {profilePic} = req.body;
    //we can access the user because this function is being called under protect route. when that function ended, we added the user to the request
    const userId = req.user._id

    if (!profilePic){
      return res.status(400).json({message: "Profile pic is required"});
    }
    
    //this allows the pic uploaded by user to be uploaded on cloudinar =y and send back a response (since await is used)
    const uploadResponse = await cloudinary.uploader.upload(profilePic)

    //now this pic is uploaded in cloudinary(a bucket for our images). we need to update that the pic belongs to the profile pic of user
    const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true}) //secure url is a field that is given back in the cloudinary response

    res.status(200).json({message:"Updated profile Pic"})

  } catch (error) {
    console.log("Error in update profile controller", error.message);
      res.status(400).json({message:"Internal Server Error"});
  }
};

export const checkAuth = (req,res) => {
  try {
    //returns the user to the page if they're still authenticated
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};