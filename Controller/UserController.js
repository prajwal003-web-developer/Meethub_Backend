const { ThrowError, GetUserByUsername, GetUserById } = require("../Utils/Utility")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../Models/User")

const Login = async (req, res) => {
    try {
        const { Username, Password } = req.body
        const user = await GetUserByUsername(Username)
        if (!user) {
            throw new Error("User Doesn't Exist")
        }

        const pass = user?.Password;
        const isMatched = bcrypt.compare(Password, pass)

        if (!isMatched) {
            throw new Error("Password Didn't Matched")
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_TOKEN,
            { expiresIn: "7d" }
        );

         const retuser =  {
            Username:user.Username,
            _id:user._id
        }



        return res.status(200).json({
            ok: true,
            message: "Logged In SuccessFully",
            token:token,
            user:retuser
        })
    } catch (error) {
        return ThrowError(error, res)
    }
}


const Register = async (req, res) => {
    try {
        const { Username, Password } = req.body
        const user = await GetUserByUsername(Username)
        if (user && user.Username) {
            throw new Error("User Already Exist")
        }

       
        const pass = await bcrypt.hash(Password, 10)

        const newUser = new User({
            Username,
            Password:pass
        })

        await newUser.save()

        const retuser =  {
            Username:newUser.Username,
            _id:newUser._id
        }

       

        const token =  jwt.sign(
            { id: newUser._id },
            process.env.JWT_TOKEN,
            { expiresIn: "7d" }
        );

       
        return res.status(200).json({
            ok: true,
            message: "Logged In SuccessFully",
            token:token,
            user:retuser
        })
    } catch (error) {
        console.log(error)
        return ThrowError(error, res)
    }
}

const me = async (req , res)=>{
    try{
        const user = await GetUserById(req.user.id)
        

        return res.status(200).json({
            user :{
                Username:user.Username,
                _id:user?._id
            }
        })
    }
    catch (error) {
        
        return ThrowError(error, res)
    }

}






module.exports = {
    Login,
    Register,
    me
}