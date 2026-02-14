const { ThrowError } = require("../Utils/Utility")

const jwt = require("jsonwebtoken")


const useMiddleware = async (req, res, next) => {
    try {
        
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);

        req.user= decoded
        next()
    } catch (error) {
        ThrowError(error, res)
    }
}

module.exports = {useMiddleware}