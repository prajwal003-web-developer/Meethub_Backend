const dotenv = require('dotenv')
const express = require('express')


dotenv.config()

const cors = require("cors")


const { app , server} = require("./Utils/Socket")
const { default: mongoose } = require('mongoose')

const userRoute = require("./Routes/user")
const roomRoute = require("./Routes/room")


app.use(cors({
    origin:['http://localhost:5173','https://prajwal-meethub.vercel.app'],
    methods:'*'
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 8080

const uri = process.env.DB_URI

mongoose.connect(uri)
    .then(()=>{
        console.log("Conneced Database")
    })
    .catch((err)=>{
        console.log(err)
    })


    app.use('/api/user', userRoute)

    app.use('/api/room', roomRoute)

server.listen(PORT,()=>{
    console.log(`Server is Running On Port ${PORT}`)
})





