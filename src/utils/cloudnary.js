import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // node.js me hota hai file ko read delte open sab kar sakte hai
import {Apierror} from "./Apierror.js";

 cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
    });


    const uploadCloudinary = async (localfilepath) =>{
        try {
         if(!localfilepath)  throw new Apierror(400, "Could not find file to upload");  
         //upload file on cloudnary
     const response =  await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
         })
         //file upload ho gyi
         console.log("file upload on cloudinary");
         console.log(response.url);
         fs.unlinkSync(localfilepath)
         return response
         
         
        } catch (error) {
            console.log("cloudnary error" ,error);
             if (localfilepath && fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath)
           
            
        }
         return null;  ///localfile ko remove karta hai
    }
    }

    export {uploadCloudinary}