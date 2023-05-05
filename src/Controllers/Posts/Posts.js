const PostSchema = require('../../Schema/Post')
const AccountSchema = require('../../Schema/Account')

async function AddPost(body) {
    const Post = new PostSchema({
        PostBody: body.PostBody,
        PostOwnerId: body.PostOwnerId,
        PostOwnerName: body.PostOwnerName,
        PostImage: body.PostImage,
        PostOwnerImage: body.PostOwnerImage,
        Link: body.link
    })
    await Post.save()
}


exports.AddPostHandler = async (req, res) => {


    try {
        const AccessControlCheck = await AccountSchema.findById(req.body.PostOwnerId).select(["_id"]).lean()

        if (req.body !== undefined && AccessControlCheck) {
            AddPost(req.body)
            res.status(200).json("done")
        } else {
            return res.status(404).json("post error")
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}



exports.EditPostHandler = async (req, res) => {

    const body = req.body
    const AccessControlCheck = await AccountSchema.findById(req.body.PostOwnerId).select(["Password"]).lean()

    try {
        if (body !== undefined && AccessControlCheck && body.AccessControl == body.PostOwnerId && AccessControlCheck.Password === body.AccessControlPassword) {
            await PostSchema.findByIdAndUpdate(body.PostId, {
                PostBody: body.PostBody,
                PostOwnerId: body.PostOwnerId,
                PostOwnerName: body.PostOwnerName,
                PostImage: body.PostImage,
                PostOwnerImage: body.PostOwnerImage,
                Link: body.link
            }).lean()

            res.status(200).json("done")
        } else {
            return res.status(404).json("post error")
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}



exports.FetchPostsHandler = async (req, res) => {

    try {

        const PayloadCount = req.body.PayloadCount
        const AccessControlCheck = await AccountSchema.findById(req.body.AccessControlId).select(["Password"]).lean()

        const Posts = await PostSchema.find(req.body.PostsOwner).select(
            ["_id", "PostBody", "PostOwnerName", "PostOwnerImage", "PostOwnerId", "PostImage", "Link", "CommentsCounter", "createdAt", "Likes"]
        ).lean(true).sort({ createdAt: -1 }).limit(PayloadCount + 10)

        if (Posts && AccessControlCheck.Password === req.body.AccessControlPassword) {
            res.status(200).json({
                ResponsePosts: Posts.splice(PayloadCount, PayloadCount + 10),
                StopFetching: Posts.length < PayloadCount ? true : false
            })
        }
        else { res.status(404).json("Posts not found") }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}



exports.FetchCommentsHandler = async (req, res) => {

    try {

        const PayloadCount = req.body.PayloadCount
        const AccessControlCheck = await AccountSchema.findById(req.body.AccessControlId).select(["Password"]).lean()
        const Posts = await PostSchema.findById(req.body.PostId).sort({ createdAt: -1 }).select(
            ["Comments"]
        ).lean()

        if (Posts && AccessControlCheck.Password === req.body.AccessControlPassword) {
            res.status(200).json({
                ResponseComments: Posts.Comments.splice(PayloadCount, PayloadCount + 10),
                StopFetching: Posts.Comments.length < PayloadCount ? true : false
            })
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}









exports.FetchSpecificPostHandler = async (req, res) => {


    try {
        const AccessControlCheck = await AccountSchema.findById(req.body.AccessControlId).select(["Password"]).lean()

        const Post = await PostSchema.findById(req.body.PostId).select(
            ["_id", "PostBody", "PostOwnerName", "PostOwnerImage", "PostOwnerId", "PostImage", "Link", "CommentsCounter", "createdAt", "Likes"]
        ).lean()

        if (Post && AccessControlCheck.Password === req.body.AccessControlPassword) {
            res.status(200).json(Post)
        } else {
            res.status(404).json("post not found")
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}


exports.DeletePostHandler = async (req, res) => {

    try {
        const AccessControlCheck = await AccountSchema.findById(req.body.AccessControlId).select(["Password"]).lean()
        if (req.body.PostOwnerId == req.body.UserId && AccessControlCheck.Password === req.body.AccessControlPassword) {
            await PostSchema.findByIdAndDelete(req.body.PostId).then(function () {
                res.status(200).json("delete")

            }).catch(function (error) {
                res.status(400).json(error.message)
            });
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}



exports.DeleteCommentsHandler = async (req, res) => {

    try {
        const AccessControlCheck = await AccountSchema.findById(req.body.AccessControlId).select(["Password"]).lean()

        if (req.body.Comment.CommentOwnerId == req.body.UserId && AccessControlCheck.Password === req.body.AccessControlPassword) {
            await PostSchema.findByIdAndUpdate(req.body.PostId, {
                $pull: { Comments: req.body.Comment },
                $set: { CommentsCounter: req.body.CommentsCounter }
            })
            res.status(200).json("done")
        } else {
            res.status(404).json("you can't delete this comment")
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}


exports.EditCommentHandler = async (req, res) => {


    try {
        const AccessControlCheck = await AccountSchema.findById(req.body.AccessControlId).select(["Password"]).lean()

        if (AccessControlCheck.Password === req.body.AccessControlPassword && req.body.comment.CommentOwnerId === req.body.AccessControlId) {
            await PostSchema.updateMany({ "_id": req.body.postId }, {
                $set: {
                    "Comments.$[el].CommentBody": req.body.commentBody
                }
            },
                { arrayFilters: [{ "el._id": req.body.comment._id }] }

            );
            res.status(200).json("done")

        } else {
            return res.status(404).json("you can't update this comment")
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}

