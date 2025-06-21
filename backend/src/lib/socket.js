//we made a rest api of mongo and express on the backend, but it doesnt support real time communication. to facilitate it, we use socket io

import { Server } from "socket.io";
import http from "http"; //built in node
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, { //we create a new server and handle the cors errors
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) { //we will give user id to this function and it will return us the socket id
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId} user id is from the DB, socket id is the id of socket

io.on("connection", (socket) => { //whenever someone connects we will get the callback function socket, it is the user that has just connected
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId; //get the id of the user that has just become online
  if (userId) userSocketMap[userId] = socket.id;//if user id existed, then update the socket map

  // io.emit() is used to send events to all the connected clients, basically to tell everybody that the particular user is online
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => { //disconnnect event
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); //lets everyone know that the user has become offline
  });
});

export { io, app, server }; //export the port, app and server