import { Apierror } from "../utils/Apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
export const verfiyJwt = asynchandler(async(req,res,next)=>{
   try {
      const token = req.cookies?.AccessToken || req.header("authorization")?.replace("Bearer ","")
      if(!token) {
       throw new Apierror(401,"unauthorization request")
      }
     const decodeInformation = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
      
    const user =  await User.findById(decodeInformation?._id).select(
       "-password -refreshToken"
      )
   
      if(!user) {
       throw new Apierror(401,"Invaild access token")
      }
        req.user = user
        next()
   } catch (error) {
      throw new Apierror(401,error?.message || "Invaild access token")
      
   }
})