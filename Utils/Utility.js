const User = require("../Models/User")

const ThrowError = async(error,res)=>{
    return res.status(500).json({
        message:error.message,
        error:error
    })
}

const GetUserById = async(id)=>{
    try {
        const user = await User.findById(id)

        if(user){
            return user
        } 
        throw new Error("No User Found")
    } catch (error) {
        return error
    }
}

const GetUserByUsername = async(Username)=>{
    try {
        const user = await User.findOne({
            Username:Username
        })

       return user; 
        
    } catch (error) {
        return error
    }
}





module.exports = {
    ThrowError,
    GetUserByUsername,
    GetUserById

}