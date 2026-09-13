import {asynchandler } from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js";
import validator from "validator";  //email ka patterm @ .com hona chiye eske liye
import {User} from "../models/user.models.js"
import {uploadCloudinary}  from "../utils/cloudnary.js"
import {Apiresponse}  from "../utils/Apiresponse.js"
import jwt from "jsonwebtoken"

import mongoose from "mongoose";


const genratedAccessAndRefreshtoken = async(userId) => {
  try {
       const user = await User.findById(userId)
   const AccessToken =   user.generateAccessToken()
   const  refreshToken =    user.generateRefreshToken()
    
    user. refreshToken = refreshToken
   await user.save({validateBeforeSave:false})

   return {AccessToken, refreshToken}
     
  } catch (error) {
    console.log("error while genrated access and refresh token",error);
    throw new Apierror(500,"Something went wrong while genrated access and refresh token")
  }
  }




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

const ExistingUser = await User.findOne({$or:[{username},{email}]

})  //es name ya email ka user ager hai to mile jayga



if(ExistingUser) {
   throw new Apierror(409,"Username and Email Already exit.")
}
console.log("FILES:", req.files);
console.log("BODY:", req.body);

 const avatarlocalPath = req.files?.avatar?.[0]?.path

let coverImagelocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
  coverImagelocalPath = req.files?.coverImage?.path
}

//  if(req.files  && Array.isArray(req.files.coverImage) &&  req.files.coverImage.length > 0) {
//   coverImagelocalPath = req.files.coverImage[0].path;
//  }
  
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


const loginUser = asynchandler(async(req,res)=>{
  //req.body => data
  //check username or email
  // find user
  //password check
  //access and refresh tokern genrated
  //send cookies
  //send response

     const {username,email,password} = req.body;

     if(!username && !email) {
      throw new Apierror(400,"username and email is required")
     }

    const user = await User.findOne({
      $or:[{username},{email}]
    })

    if(!user) {
      throw new Apierror(404,"User does not exit")
    }

  const ispasswordValidater =   await user.passwordCorrect(password)
  if(!ispasswordValidater) {
      throw new Apierror(401,"password is incorrct")
  }

 const {AccessToken, refreshToken} = await  genratedAccessAndRefreshtoken(user._id)

    const loginedUser = await User.findById(user._id).select(  //.select esliye use kiya kyuki muijhe apna hash password or refresh token fronted ko nhi dekhna.
   "-password -refreshToken"
 )

 const options ={
  httpOnly:true,
  secure:true,

 }

 return res.
 status(200).
 cookie("AccessToken",AccessToken,options).
 cookie("refreshToken",refreshToken,options).
 json(
  new Apiresponse(200,
    {
      user:loginedUser,refreshToken,AccessToken
    },
    "user login successfully"
  )
 )

  
})

 const logoutUser = asynchandler(async(req,res)=>{
  User.findByIdAndUpdate(req.user._id,{$unset:{
    refreshToken:1
  }},
  {
    new : true
  }
)


const options ={
  httpOnly:true,
  secure:true,

 }
 return res.
 status(200).
 clearCookie("AccessToken",options).
 clearCookie("refreshToken",options).
 json(
  new Apiresponse(200,{},"User successfully logout")
 )


 })

 const refreshAccesstoken = asynchandler(async (req,res) => {
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken


     if(!incomingRefreshToken) {  
      throw new Apierror(410,"unauthorization request")
     }

   try {
    const decodedToken =  jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
      )
 
   const user =  await User.findById(decodedToken?._id)
 
      if(!user) { 
       throw new Apierror(410,"Invaild refresh token")
      }
   
 
       if(incomingRefreshToken !== user?.refreshToken) {
          throw new Apierror(410,"Refresh token is expired or used")
       }
 
       
 const options ={
   httpOnly:true,
   secure:true,
 
  }
 
      const {AccessToken,newrefreshToken} = await genratedAccessAndRefreshtoken(user._id)
 
        return res
        .status(200)
        .cookie("AccessToken",AccessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
         new Apiresponse(200,{AccessToken,refreshToken:newrefreshToken},"access token refersh successfully")
        )
   } catch (error) {
    throw new Apierror(401,error?.massage || "Invaild refresh token")
    
   }
 })


 const changeCurrentPassword = asynchandler(async(req,res)=>{

  const {oldpassword,newpassword} = req.body;
  const user =  await User.findById(req.user?._id)

    const ispasswordCorrectornot =   await  user.passwordCorrect(oldpassword)  // true ya false dega
      
    if(!ispasswordCorrectornot) {
      throw new Apierror(400,"Invaild password")
    }

    user.password = newpassword
  await  user.save({validateBeforeSave:false})

    return res.
    status(200).
    json(new Apiresponse(200,"password change successfully"))
    
 })

 const getCurrentUser = asynchandler(async(req,res)=>{
    return res.
    status(200).
    json(new Apiresponse(200,req.user,"currentUser fetch successfully"))
   
 })

 const updateAccoutDetail = asynchandler(async(req,res)=>{
  const {username,email,fullName} = req.body;
     if(!username || !email || !fullName) {
      throw new Apierror(400,"All filed are required")
     }

   const user = await User.findByIdAndUpdate(req.user?._id,{
         $set:{
           fullName:fullName,  // chye to username:useranem likh lo ya fir username
           email,
           username,
         }
     },{
      new:true
     }).select("-password")
     return res.
     status(200).
     json(new Apiresponse(200,user,"All filed are successfully updated"))
 })

 const updateAvatar = asynchandler(async(req,res)=>{
   const avatarlocalPath =  req.file?.path

     if(!avatarlocalPath) {
      throw new Apierror(400,"avatar file is missing")
     }

   const avatar = await  uploadCloudinary(avatarlocalPath)

     if(!avatar.url) {
      throw new Apierror(400,"Error when uploading avatar")
     }

  const user = await  User.findByIdAndUpdate(req.user?._id,{$set:{
          avatar:avatar.url
     }},{
      new:true
     }).select("-password")

   return res.
    status(200).
    json(new Apiresponse(200,user,"avatar uploaded successfully"))
     
 })

 const updatecoverImage = asynchandler(async(req,res)=>{
  const coverImagelocalPath =  req.file?.path
   
   if(!coverImagelocalPath) {
        throw new Apierror(400,"coverImage file is missing")
   }

   const coverImage =  await  uploadCloudinary(coverImagelocalPath)
   
     if(!coverImage.url) {
      throw new Apierror(400,"Error when uploading coverImage")
     }

 const user =   await User.findByIdAndUpdate(req.user?._id,{
      $set:{
        coverImage:coverImage.url
      },
    },{new:true}).select("-password")

    return res.
    status(200).
    json(new Apiresponse(200,user,"coverImage uploaded successfully"))
     
 })


 const getUserChannelProfile = asynchandler(async(req,res)=>{
        const {username} = req.params

    if(!username?.trim()){
      throw new Apierror(400,"username is missing")
    }

 const channal =  await User.aggregate([       // channal ak array hota hai
      {
        $match:{
          username:username?.toLowerCase()
        }
      },

      {
        $lookup:{
          from:"subcriptions",
          localField:"_id",
          foreignField:"channal",
          as:"subcribers"
        }
      },
      
      {
         $lookup:{
          from:"subcriptions",
          localField:"_id",
          foreignField:"Subcriber",
          as:"subscriberto"
        }

      },
      {
        $addFields:{
          subcribersCout:{
            $size:"$subcribers"
          },
          channalSubcribeCount:{
            $size:"$subscriberto"
          },
          isSubscribe:{
            $cond:{
              if:{$in:[req.user?._id,"$subcribers.Subcriber"]},
              then:true,
              else:false
            } 
          }
        }
      },
      {
        $project:{
          fullName:1,
          username:1,
           subcribersCout:1,
            channalSubcribeCount:1,
            isSubscribe:1,
            avatar:1,
            coverImage:1,
            email:1



        }
      }
     
    ])

    if(!channal?.length){
      throw new Apierror(404,"channal does not exit")
    }
  return  res.
  status(200).
  json(new Apiresponse(200,channal[0],"user channal fetch successfully"))

 })


 const getwatchHistory = asynchandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user?._id)    //mongodb user ki id hoti hai vo staring me hoti hai vo nhi samhj tha esliye
      }
    },
     {
       $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1

                  }
                }
              ]
            }
          }
        ]
      }
     },
     {
      $addFields:{
      owner:{
        $first:"$owner"
        
      }
     }
     }
  ])

    return res.status(200).
     json(new Apiresponse(200,user[0].watchHistory,"watch history fetch successfully"))
 })
    

    export  {registerUser,
      loginUser,
      logoutUser,
      refreshAccesstoken,
      changeCurrentPassword,
      getCurrentUser,
      updateAccoutDetail,
      updateAvatar,
      updatecoverImage,
      getUserChannelProfile,
      getwatchHistory
    };