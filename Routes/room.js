
const express = require("express")
const { useMiddleware } = require("../Middleware/middleware")
const { createRoom, GetRooms, DeleteRoom, JoinRoom, GetRoomData, Leave, sendMessage } = require("../Controller/RoomController")

const Router = express.Router()

Router.post("/create", useMiddleware,createRoom)
Router.post("/get-all", useMiddleware,GetRooms)
Router.post("/send-message/:RoomId", useMiddleware,sendMessage)
Router.get("/get/:RoomId", useMiddleware,GetRoomData)
Router.delete("/delete/:RoomId", useMiddleware,DeleteRoom)

Router.get("/join/:RoomId/:Password", useMiddleware,JoinRoom)
Router.get("/leave/:RoomId", useMiddleware,Leave)


module.exports = Router 