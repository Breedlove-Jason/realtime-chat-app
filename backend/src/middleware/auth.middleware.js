import jwt from "jsonwebtoken";

import {User} from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: "No token provided, please login first."});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            res.status(401).json({message: "Unauthorized - Invalid Token"})
        }
        const user = await User.findById(decoded.userId).select("-password");
    } catch (e) {
        console.error(e);
    }
}