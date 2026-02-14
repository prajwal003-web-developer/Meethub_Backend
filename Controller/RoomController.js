const Message = require("../Models/Message");
const Room = require("../Models/Room");
const User = require("../Models/User");
const { io } = require("../Utils/Socket");
const { ThrowError, GetUserById } = require("../Utils/Utility")

const createRoom = async (req, res) => {
    try {
        const { Name, isPrivate, Password, longitude, latitude } = req.body

        const id = req.user.id;

        const user = await GetUserById(id)

        const isRoomAvailable = await Room.find({ CreatedBy: id })

        if (isRoomAvailable.length > 0) {
            throw new Error("You Have Already Created Room ")
        }

        if (isPrivate && Password?.length < 4) {
            throw new Error("Passworld Should be of 4 digit")
        }

        const rest = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        const myData = await rest.json();

        const myArea = myData.city || myData.locality || myData.principalSubdivision || "Unknown"

        const newRoom = new Room({
            Name: Name,
            isPrivate: isPrivate,
            Password: Password,
            Location: { coordinates: [longitude, latitude] },
            CreatedBy: id,
            Members: [id],
            Area: myArea
        })

        await newRoom.save()

        return res.status(200).json({
            Room: {
                Name: newRoom?.Name,
                isPrivate: isPrivate,
                CreatedBy: user?.Username,
                createdAt: newRoom.createdAt
            },
            ok: true,
            message: "Room Created Succesfully"

        })

    } catch (error) {
        console.log(error)
        return ThrowError(error, res)
    }
}

const GetRooms = async (req, res) => {
    try {
        const { longitude, latitude } = req.body;

        const id = req.user.id

        const rooms = await Room.find({
            Location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: 5000,
                },
            },
        }).populate("CreatedBy")


        const DataToSend = rooms.map((itm) => {
            const IsCreator = itm?.CreatedBy?._id == id
            let HasJoined = false

            itm?.Members?.map(itm => {
                if (itm == id) {
                    HasJoined = true;
                    return;
                }
            })
            return {
                CreatedBy: {
                    Username: itm?.CreatedBy?.Username,
                    _id: itm?.CreatedBy?._id
                },
                Members: itm?.Members,
                Name: itm?.Name,
                isPrivate: itm?.isPrivate,
                createdAt: itm?.createdAt,
                IsAdmin: IsCreator,
                HasJoined,
                _id: itm?._id,
                Area: itm?.Area

            }
        })


        return res.status(200).json({
            data: DataToSend,
            ok: true
        })

    } catch (error) {
        console.log(error)
        return ThrowError(error, res)
    }
}

const DeleteRoom = async (req, res) => {
    try {
        const { RoomId } = req.params

        const id = req.user.id

        const roomdata = await Room.findById(RoomId)

        if (roomdata.lenght == 0) {
            throw new Error("No Room Found")
        }

        //console.log(roomdata?.CreatedBy ,id)

        if (roomdata.CreatedBy.toString() != id) {
            throw new Error("You Can't Delete Other's Room")
        }

        await Room.deleteOne({ _id: RoomId })

        await Message.deleteMany({ Room: RoomId })

        io.to(RoomId).emit("removed")

        return res.status(200).json({
            message: "Room Deleted Succesfully",
            ok: true
        })
    } catch (error) {
        return ThrowError(error, res)
    }
}

const JoinRoom = async (req, res) => {
    try {
        const { RoomId, Password } = req.params
        const id = req.user.id


        const roomData = await Room.findById(RoomId);

        if (roomData.lenght == 0) {
            throw new Error("No Room Found")
        }

        let isInRoom = false;

        roomData?.Members.map((itm) => {
            if (itm.toString() == id) {
                isInRoom = true;
                return
            }
        })

        if (isInRoom) {
            throw new Error("Already in Room")
        }

        if (roomData.isPrivate) {
            if (roomData.Password != Password) {
                throw new Error("Password Didnot Match")
            }
        }

        roomData?.Members.push(id)

        await roomData.save()

        return res.status(200).json({
            ok: true,
            id: RoomId
        })
    } catch (error) {
        return ThrowError(error, res)
    }
}

const Leave = async (req, res) => {
    try {
        const { RoomId } = req.params
        const id = req.user.id


        const roomData = await Room.findById(RoomId);

        if (roomData.lenght == 0) {
            throw new Error("No Room Found")
        }

        let isInRoom = false;

        roomData?.Members.map((itm) => {
            if (itm.toString() == id) {
                isInRoom = true;
                return
            }
        })

        if (!isInRoom) {
            throw new Error("Not in Room")
        }

        roomData.Members = roomData.Members.filter((itm) => itm._id != id)

        await roomData.save()

        return res.status(200).json({
            ok: true,
            id: RoomId
        })
    } catch (error) {
        return ThrowError(error, res)
    }
}

const GetRoomData = async (req, res) => {
    try {
        const id = req.user.id;

        const { RoomId } = req.params

        const roomData = await Room.findById(RoomId).populate([
            { path: "Members", select: "Username _id" },
            { path: "CreatedBy", select: "Username _id" },
        ])

        let isExist = false;

        roomData?.Members.map((itm) => {
            if (itm?._id.toString() == id) {
                isExist = true
            }
        })

        if (!isExist) {
            throw new Error("Not In Group")
        }

        const Messages = await Message.find({
            Room:RoomId
        }).populate({
            path:"SentBy",
            select:"Username _id"
        })

        return res.status(200).json({
            data: roomData,
            Messages:Messages
        })
    } catch (error) {
        return ThrowError(error, res)
    }
}


const sendMessage = async (req,res) => {
    try {
        const id = req.user.id;

        const { RoomId } = req.params

        const {Text} = req.body

        if(!Text){
            throw new Error("No Text Cant be Sent")
        }

        const roomData = await Room.findById(RoomId);

        if (roomData.lenght == 0) {
            throw new Error("No Room Found")
        }

        let isInRoom = false;

        roomData?.Members.map((itm) => {
            if (itm.toString() == id) {
                isInRoom = true;
                return
            }
        })

        if (!isInRoom) {
            throw new Error("Not in Room")
        }

        const newMessage = new Message({
            Text:Text,
            SentBy:id,
            Room:RoomId
        }) 

        const Users = await User.findById(id)

        await newMessage.save()

        const dataToEmit = {
            Text:Text,
            SentBy:{
                Username:Users.Username,
                _id:Users._id
            },
            createdAt:newMessage.createdAt
        }

        io.to(RoomId).emit("new_message",dataToEmit)

        return res.status(200).json({
            message: "Ok"
        })


    } catch (error) {
        return ThrowError(error, res)
    }
}

module.exports = {
    createRoom,
    GetRooms,
    DeleteRoom,
    JoinRoom,
    Leave,
    GetRoomData,
    sendMessage
}
