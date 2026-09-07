import mongoose from "mongoose";
import {DATA_BASE} from "../constent.js"

const connectDB = async () =>  {
    try {
     const connectionIntace  =  await mongoose.connect(`${process.env.MONGODB_URL}/${DATA_BASE}`);
     console.log(`\n connect to data!${connectionIntace.connection.host}`);
     
    }catch(error) {
        console.log("MONGODB CONNECTION ERROR",error);
        process.exit(1)
    }
 

  
}

export default connectDB;