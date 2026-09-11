import mongoose, {Schema} from "mongoose";


const subcriptionSchema = new Schema(
    {

        Subcriber:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        channal:{
               type:Schema.Types.ObjectId,
            ref:"User"

        }
    },{timestamps:true}



)


export const Subcription = mongoose.model("Subcription",subcriptionSchema)
  