import {asynchandler } from "../utils/asynchandler.js"
import {Apierror} from "./Apierror";
import validator from "validator";  //email ka patterm @ .com hona chiye eske liye
import {User} from "../models/user.models.js"
import {uploadCloudinary}  from "../utils/cloudnary.js"
import {Apiresponse}  from "../utils/Apiresponse.js"
const registerUser = asynchandler(async (req,res)=>{
   //get user detail from frontend
   //validation-not empty
   //check if user is alread exit check username or email se.
   //check for image and avatar
   //upload into cloudinary
   //create user object : create entry in db
   //remove password and refesh token filed from response
   //check user creation if user create return response and not return error
   const {username,fullName,email,password} = req.body;
  // console.log("email",email);
   
   //  if(fullName == "") {
   //    throw new Apierror(400,"Enter fullName")
   //  }

   if([fullName,username,email,password].some((field)=>(field?.trim() === ""))


)
   
   {
      throw new Apierror(400,"All field are required")

}


if (!validator.isEmail(email)) {
    throw new Apierror(400, "Please enter a valid email address");
}

const ExistingUser = User.findOne({$or:[{username},{email}]

})  //es name ya email ka user ager hai to mile jayga

if(!ExistingUser) {
   throw new Apierror(409,"Username and Email Already exit.")
}

const avatarlocalPath = req.files?.avatar[0]?.path
const coverImagelocalPath = req.files?.coverImage[0]?.path

if(!avatarlocalPath) {
   throw new Apierror(400,"Avatar file required")
}

 const avatar  =   await uploadCloudinary(avatarlocalPath);
  const coverImage = await uploadCloudinary(coverImagelocalPath);

  if(!avatar) {
    throw new Apierror(400,"Avatar file required")
  }


  const user = await User.create({
   fullName,
   avatar:avatar.url,
   coverImage:coverImage?.url || "",
   email,
   password,
   username:username.toLowerCase()
  })

 const createdUser = await User.findById(user._id).select(  //.select esliye use kiya kyuki muijhe apna hash password or refresh token fronted ko nhi dekhna.
   "-password -refreshToken"
 )

 if(!createdUser) {
   throw new Apierror(500,"something went wrong while regetring the user")
 }


 return res.status(201).json(
   new Apiresponse(200,createdUser,"user regiester successfully")
 )

})




    export  {registerUser};