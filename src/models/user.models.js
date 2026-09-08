import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new Schema(
    {
        username:{
            type:String,
            required:[true,"username must required"],
            unique:true,
            lowercase:true,
            trim:true,
            index:true  ///searching filed
           
        },
         email:{
            type:String,
            required:[true,"email must required"],
            unique:true,
            lowercase:true,
            trim:true,
           
           
        },
         fullName:{
            type:String,
            required:[true,"avatar must fullName"],
            trim:true,
            index:true  ///searching filed
           
        },
        avatar: {
      type:String, //cloudnary se laayge
      required:[true,"avatar must required"]
        },
        coverImage: {
            type:String,
        },
        watchHistory : [
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password: {
            type:String,
            required:[true,"password must required"]
        },
        refreshToken:{
            type:String
        }

},{timestamps:true}

)

userSchema.pre("save",async function(next) {
    if(!this.isModified("password"))  return next() // paswsword hash ho raha hai
    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.passwordCorrect = async function(password) {  // user ne jo diya or hash password ko compare karna hai
 return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
 return  jwt.sign(
        {
            _id : this_id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPRIY
        }
    )
}
userschema.methods.generateRefreshToken = function() {
     return  jwt.sign(
        {
            _id : this_id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPRIY
        }
    )
}

 export const User = mongoose.model("User",userSchema)

