const express = require("express")
const router = express.Router()
const PostsController = require("../Controllers/Posts")

router.post("/", PostsController.AddPostHandler)
router.post("/Edit", PostsController.EditPostHandler)
router.post("/Get", PostsController.FetchPostsHandler)
router.post("/GetComments", PostsController.FetchCommentsHandler)
router.put("/AddLike", PostsController.AddLikeHandler)
router.put("/AddComment", PostsController.AddCommentHandler)
router.post("/Post", PostsController.FetchSpecificPostHandler)
router.post("/Delete", PostsController.DeletePostHandler)

module.exports = router  