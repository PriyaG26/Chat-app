import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import {connectDB} from "./lib/db.js"
import {app,server} from "./lib/socket.js"
import cors from "cors"
import path from "path";


dotenv.config()

// const app = express(); //Before creating a socket, we made an express app, but for real time communication, we needed socket io. so we built a socket io server on top of express
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json()); //this app refers to the app that we made in socket js file
app.use(cookieParser()); //allows the application to parse the cookie for getting the token
app.use( //since our frontend and backend were at different ports, we needed to sync them so that we can send a request from FE to BE
  cors({
    origin: "http://localhost:5173",
    credentials: true, //allow the cookies or auth headers to be sent with the headers
  })
);

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

if (process.env.NODE_ENV === "production") { //middle layer
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, ()=>{ //previously it was app.listen, but since we have made a socket io server, it works on top of express and makes an abstraction layer
    console.log("Server is running on port:" + PORT);
    connectDB()
})