import {asynchandler } from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js";
import {Apiresponse}  from "../utils/Apiresponse.js"
import mongoose from "mongoose";

import {PlayList} from "../models/palylist.models.js"


const createPlaylist = asynchandler(async(req,res)=>{
    const {name,description} = req.body

    if(!name || name?.trim() === ""){
        throw new Apierror(400,"name is required")
    }

  const newplaylist =   await PlayList.create(
        {
            name:name,
            description:description || "",
            video:[],
            owner:req.user?._id
        }
     )

     return res.status(200).
     json(new Apiresponse(200,newplaylist,"playlist created successfully"))
})

const getPlaylistById = asynchandler(async(req,res)=>{
    const {playlistId} = req.params

    if(!mongoose.isValidObjectId(playlistId)) {
        throw new Apierror(400,"playlist does not exit")
    }


     
    const searchPlaylist = await PlayList.findById(playlistId)
    .populate("videos","thumbnail title description duration views")
    .populate("owner","username avatar")
     
   if(!searchPlaylist) {
    throw new Apierror(400,"playlist does not exit")
   }

 return res.status(200).
   json(new Apiresponse(200,searchPlaylist,"playlist fetch successfully"))

})

const getUserPlaylists = asynchandler(async(req,res)=>{
    const {userId}  = req.params

    if(!mongoose.isValidObjectId(userId)) {
        throw new Apierror("user playlist id not vaild")
    }

  const userplaylist =  await PlayList.find({owner:userId})
  .sort({ createdAt: -1})
   return res.status(200).
   json(new Apiresponse(200,userplaylist,"user playlist successfully fetch"))
})

const addVideoToPlaylist = asynchandler(async(req,res)=>{
   const {playlistId,videoId} = req.params


   if(!mongoose.isValidObjectId(playlistId)) {
    throw new Apierror(400,"playlist id is required")
   }

   const playlist =  await PlayList.findById(playlistId) 
   if(!playlist) {
     throw new Apierror(400,"playlist does not exit")
   }
     if(playlist.owner.toString() !== req.user?._id.toString()) {
        throw new Apierror(400,"you are not authorized for add playlist")
     }

     if(playlist.videos.includes(videoId)) {
         throw new  Apierror(400, "Video already in playlist");
     }
   const addSomeplaylist =  await PlayList.findByIdAndUpdate(playlistId,{$push:{videos: videoId}},{new:true})

   return res.status(200).
   json(new Apiresponse(200,addSomeplaylist,"In your playlist add video"))
})

const removeVideoFromPlaylist = asynchandler(async(req,res)=>{
    const {playlistId,videoId} = req.params

    if(!mongoose.isValidObjectId(playlistId)){
        throw new Apierror(400,"palylist id is required")
    }

  const playlist =  await PlayList.findById(playlistId)
    if(!playlist) {
        throw new Apierror(400,"playlist does not exit")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()) {
        throw new Apierror(400,"you are not authorized for add playlist")
     }

  const removeVideoFromPlaylist =   await PlayList.findByIdAndDelete(playlistId,{$pull:{videos:videoId}},{new:true})


  res.status(200).
  json(new Apiresponse(200,removeVideoFromPlaylist,"video remove from playlist"))
    
})

const deletePlaylist = asynchandler(async(req,res)=>{
    const {playlistId} = req.params

    if(!mongoose.isValidObjectId(playlistId)) {
        throw new Apierror(400,"playlist id is required")
    }

  const playlist =  await PlayList.findById(playlistId)

    if(!playlist) {
        throw new Apierror(400,"this playlist does not exit")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()) {
        throw new Apierror(400,"you are not authorized to delete this playlist")
    }

     await PlayList.findByIdAndDelete(playlist)

    return res.status(200).
    json(new Apiresponse(200,{},"palylist delete successfully"))
})

const updatePlaylist = asynchandler(async(req,res)=>{
        const {playlistId} = req.params
        const {newname,newdescription} = req.body

    if(!mongoose.isValidObjectId(playlistId)) {
        throw new Apierror(400,"playlist id is required")
    }
    if(!newname?.trim()) {
        throw new Apierror("name is required")
    }

  const playlist =  await PlayList.findById(playlistId)

    if(!playlist) {
        throw new Apierror(400,"this playlist does not exit")
    }

    if(playlist.owner.toString() !==req.user?._id.toString()) {
        throw new Apierror(400,"you are not authorized to update this playlist")
    }

 const updateplaylists =  await PlayList.findByIdAndUpdate(playlistId,{name:newname,description:newdescription},{new:true})
     
    return res.status(200).
    json(new Apiresponse(200,updateplaylists,"palylist update successfully"))

})

 export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}