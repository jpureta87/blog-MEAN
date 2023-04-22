const express = require("express");

const checkAuth = require("../middleware/check-auth");
const postsController = require("../controllers/posts");
const extractFile = require("../middleware/file");

const router = express.Router();

//CreatePost
router.post("", checkAuth, extractFile, postsController.createPost);

//getPosts
router.get("", postsController.getPosts);

//deletePost
router.delete("/:id", checkAuth, postsController.deletePost);

//updatePost
router.put("/:id", checkAuth, extractFile, postsController.updatePost);

//getPostById
router.get("/:id", postsController.getPostById);

module.exports = router;
