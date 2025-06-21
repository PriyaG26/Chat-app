import mongoose from "mongoose";

export const connectDB = async () => {
    //we use a try catch block so that if there's any issue in connection, the app doesnt throw an error
  try {
    //we connect the db using mongoose.connect. we await this process as this is gonna take some time
    const conn = await mongoose.connect(process.env.MONGODB_URI); 
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};