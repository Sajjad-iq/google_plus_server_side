const PostSchema = require('../../Schema/Post')
const sharp = require('sharp');

async function AddPost(body, postImage) {

    const Post = new PostSchema({
        PostBody: body.PostBody,
        PostOwnerId: body.PostOwnerId,
        PostOwnerName: body.PostOwnerName,
        PostImage: postImage,
        PostOwnerImage: body.PostOwnerImage,
        Link: body.link,
        PostFrom: body.PostFrom,
        CollectionName: body.CollectionName,
        CollectionId: body.CollectionId,
        CollectionOwnerId: body.CollectionOwnerId,
        PrivateShareUsersIds: body.PrivateShareUsersIds
    })
    await Post.save()
}


exports.AddPostHandler = async (req, res) => {


    try {
        if (req.body !== undefined && req.session.UserId) {

            // convert from base64 
            let base64Image = req.body.PostImage.split(';base64,').pop();
            let imgBuffer = Buffer.from(base64Image, 'base64');

            // resize 
            sharp(imgBuffer)
                .resize(1280, 720)
                .webp({ quality: 75, compressionLevel: 7 })
                .toBuffer()
                // add new post
                .then(data => {
                    let newImagebase64 = `data:image/webp;base64,${data.toString('base64')}`
                    AddPost(req.body, newImagebase64)
                })
                .catch(err => console.log(`downisze issue ${err}`))

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

        if (body !== undefined && req.session.UserId == body.PostOwnerId) {
            await PostSchema.findByIdAndUpdate(body.PostId, {
                PostBody: body.PostBody,
                PostOwnerId: body.PostOwnerId,
                PostOwnerName: body.PostOwnerName,
                PostImage: body.PostImage,
                PostOwnerImage: body.PostOwnerImage,
                Link: body.link,

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
            ["_id", "PostBody", "PostOwnerName", "PostOwnerImage", "PostOwnerId", "PostImage", "Link", "CommentsCounter", "createdAt", "Likes", "PostFrom", "CollectionName", "CollectionId", "PrivateShareUsersIds", "CollectionOwnerId"]
        ).lean(true).sort({ createdAt: -1 }).limit(PayloadCount + 10)


        if (Posts && req.session.UserId) {

            if (req.body.forCollectionsPreviewWindow) {
                res.status(200).json({
                    ResponsePosts: Posts.splice(PayloadCount, PayloadCount + 10),
                    StopFetching: Posts.length < PayloadCount ? true : false
                })

            } else {
                const NewPosts = Posts.map((e) => {
                    if (e.PostFrom === "Collections") {
                        const FollowingCollectionsArr = req.body.FollowingCollections || [];
                        if (FollowingCollectionsArr.includes(e.CollectionId) | e.CollectionOwnerId === req.session.UserId) return e
                    } else return e
                })
                res.status(200).json({
                    ResponsePosts: NewPosts.splice(PayloadCount, PayloadCount + 10),
                    StopFetching: Posts.length < PayloadCount ? true : false
                })

            }

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

        if (Posts && req.session.UserId) {
            res.status(200).json({
                ResponseComments: Posts.Comments.splice(PayloadCount, PayloadCount + 10),
                StopFetching: Posts.Comments.length < PayloadCount ? true : false
            })
        } else return res.status(404).json("your don't sign in")

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}



exports.FetchSpecificPostHandler = async (req, res) => {


    try {
        const Post = await PostSchema.findById(req.body.PostId).select(
            ["_id", "PostBody", "PostOwnerName", "PostOwnerImage", "PostOwnerId", "PostImage", "Link", "CommentsCounter", "createdAt", "Likes", "PostFrom", "CollectionName", " CollectionId", "PrivateShareUsersIds"]
        ).lean()

        if (Post && req.session.UserId) {
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
        if (req.body.PostOwnerId == req.session.UserId) {
            await PostSchema.findByIdAndDelete(req.body.PostId).then(function () {
                res.status(200).json("delete")

            }).catch(function (error) {
                res.status(400).json(error.message)
            });
        } else return res.status(404).json("your don't sign in")

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}



exports.DeleteCommentsHandler = async (req, res) => {

    try {
        if (req.body.Comment.CommentOwnerId == req.session.UserId) {
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

        if (req.body.comment.CommentOwnerId === req.session.UserId) {
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

