import express from "express";
// import Authenticated from "../middlewares/Authenticated.js";
import upload from "../middlewares/multer.js";
import {
  createGroup,
  getGroup,
  uploadImages,
} from "../controllers/group.controller.js";

const router = express.Router();

router.route("/upload-images").post(upload.array("images"), uploadImages);
router.route("/create-group").post(createGroup);
router.route("/:id").get(getGroup);

export default router;
