// routes/video.routes.js
import { Router } from "express";
import {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
} from "../controllers/video.controllers.js";
import { verfiyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.use(verfiyJwt);

router.route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      { name: "videoFiles", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 }
    ]),
    publishVideo
  );

router.route("/:videoId")
  .get(getVideoById)
  .patch(upload.single("thumbnail"), updateVideo)
  .delete(deleteVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;