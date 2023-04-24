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
        if (req.body !== undefined) {
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

    try {
        if (body !== undefined) {
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
        const Posts = await PostSchema.find(req.body.PostsOwner).select(
            ["_id", "PostBody", "PostOwnerName", "PostOwnerImage", "PostOwnerId", "PostImage", "Link", "CommentsCounter", "createdAt", "Likes"]
        ).lean(true).sort({ createdAt: -1 }).limit(PayloadCount + 10)

        if (Posts) {
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
        const Posts = await PostSchema.findById(req.body.PostId).sort({ createdAt: -1 }).select(
            ["Comments"]
        ).lean()

        if (Posts) {
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

    const Post = await PostSchema.findById(req.body.PostId).select(
        ["_id", "PostBody", "PostOwnerName", "PostOwnerImage", "PostOwnerId", "PostImage", "Link", "CommentsCounter", "createdAt", "Likes"]
    ).lean()
    try {
        if (Post) {
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
        if (req.body.PostOwnerId == req.body.UserId) {
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
        if (req.body.Comment.CommentOwnerId == req.body.UserId) {
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
        await PostSchema.updateOne({ "Comments._id": req.body.comment._id }, {
            $set: {
                "Comments.$[el].CommentBody": req.body.commentBody
            }
        },
            { arrayFilters: [{ "el._id": req.body.comment._id }] }

        );

        res.status(200).json("done")

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}

