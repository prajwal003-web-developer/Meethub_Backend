const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors')

const app = express();
const server = createServer(app);
const io = new Server(server,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const SocketToUser = new Map();
const UserToSocket = new Map()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let userId

  if(socket.handshake.auth.id){
     userId = socket?.handshake?.auth?.id
  }

  if(!userId){
    return
  }

  const prevSocketId = UserToSocket.get(userId)

  if(prevSocketId){
    UserToSocket.delete(userId)
  }

  UserToSocket.set(userId,socket.id)
  SocketToUser.set(socket.id, userId)

  socket.on("Join_room",(roomId)=>{
    socket.join(roomId)

    console.log("Joined")
  })

  socket.on("leave_room",(roomId)=>{
    socket.leave(roomId)
   
    console.log("Left")
  })


  socket.on("disconnect", () => {
    const uid = SocketToUser.get(socket.id);
    if (!uid) return;

    // remove both sides
    SocketToUser.delete(socket.id);

    // only delete user mapping if this socket is the latest one
    if (SocketToUser.get(uid) === socket.id) {
      UserToSocket.delete(uid);
    }
    console.log("User disconnected:", socket.id);
  });
});

const GetSocket= () =>{
    if(!io){
        return "No Socket Found"
    }
    return io
}

module.exports = {
    app, server, io,
    GetSocket,
    
}