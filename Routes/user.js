
const express = require("express")
const { Login, Register, me } = require("../Controller/UserController")
const {useMiddleware} = require("../Middleware/middleware")

const Router = express.Router()

    Router.post("/login", Login)
    Router.post("/register", Register)
    Router.get("/me",useMiddleware ,me)

module.exports = Router