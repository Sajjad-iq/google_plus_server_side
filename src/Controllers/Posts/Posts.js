const PostSchema = require('../../Schema/Post')
const sharp = require('sharp');
const CommentsSchema = require('../../Schema/Comments')
const NotificationsSchema = require("../../Schema/Notifications")

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

            if (req.body.PostImage !== "") {

                // convert from base64 
                let base64Image = req.body.PostImage.split(';base64,').pop();
                let imgBuffer = Buffer.from(base64Image, 'base64');

                // resize 
                sharp(imgBuffer)
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
                AddPost(req.body, "")
                res.status(200).json("done")
            }
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

        if (body.PostImage !== "") {

            // convert from base64 
            let base64Image = body.PostImage.split(';base64,').pop();
            let imgBuffer = Buffer.from(base64Image, 'base64');
            // resize 
            sharp(imgBuffer)
                .webp({ quality: 75, compressionLevel: 7 })
                .toBuffer()
                // add new post
                .then(async (data) => {
                    let newImagebase64 = `data:image/webp;base64,${data.toString('base64')}`

                    await PostSchema.findByIdAndUpdate(body.PostId, {
                        PostBody: body.PostBody,
                        PostOwnerId: body.PostOwnerId,
                        PostOwnerName: body.PostOwnerName,
                        PostImage: newImagebase64,
                        PostOwnerImage: body.PostOwnerImage,
                        Link: body.link,
                    }).lean()
                })
                .catch(err => console.log(`downisze issue ${err}`))

            res.status(200).json("done")
        } else {
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
            } else return res.status(404).json("post error")
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}



exports.FetchPostsHandler = async (req, res) => {

    try {
        if (req.session.UserId) {

            const PayloadCount = req.body.PayloadCount || 0
            const Posts = await PostSchema.find(req.body.PostsOwner).lean(true).sort({ createdAt: -1 }).limit(PayloadCount + 5)


            if (req.body.forCollectionsPreviewWindow) {
                res.status(200).json({
                    ResponsePosts: Posts.splice(PayloadCount, PayloadCount + 5),
                    StopFetching: Posts.length < PayloadCount ? true : false
                })

            } else {
                const NewPosts = Posts.map((e) => {
                    const FollowingCollectionsArr = req.body.FollowingCollections || [];
                    if (!req.body.BlackList.includes(e.PostOwnerId)) {
                        if (e.PostFrom === "Collections") {
                            if (FollowingCollectionsArr.includes(e.CollectionId) | e.CollectionOwnerId === req.session.UserId) return e
                        } else return e
                    }
                })
                res.status(200).json({
                    ResponsePosts: NewPosts.splice(PayloadCount, PayloadCount + 5),
                    StopFetching: Posts.length < PayloadCount ? true : false
                })

            }

        }
        else { res.status(404).json("invalid access") }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}



exports.FetchCommentsHandler = async (req, res) => {

    try {

        const PayloadCount = req.body.PayloadCount
        const Comments = await CommentsSchema.find({ CommentFromPost: req.body.PostId }).lean().limit(PayloadCount + 10)

        if (Comments && req.session.UserId) {
            res.status(200).json({
                ResponseComments: Comments.splice(PayloadCount, PayloadCount + 10),
                StopFetching: Comments.length < PayloadCount ? true : false
            })
        } else return res.status(404).json("your don't sign in")

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}



exports.FetchSpecificPostHandler = async (req, res) => {


    try {

        const Post = await PostSchema.findById(req.body.PostId).lean()

        if (req.body.setNotificationAsRead) {
            await NotificationsSchema.updateOne({
                NotificationByAccount: req.body.NotificationsData.NotificationByAccount,
                NotificationOnClickTargetId: req.body.NotificationsData.NotificationOnClickTargetId
            }, { $set: { Read: true } }
            )
        }

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
        if (req.body.CommentOwnerId == req.session.UserId) {

            await CommentsSchema.findByIdAndDelete(req.body.CommentId)

            await PostSchema.findByIdAndUpdate(req.body.PostId, {
                $inc: { CommentsCounter: -1 }
            }).lean().select(["CommentsCounter"])

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

    const body = req.body
    try {

        if (body.comment.CommentOwnerId === req.session.UserId) {



            if (body.comment.CommentImage !== "") {

                // convert from base64 
                let base64Image = body.comment.CommentImage.split(';base64,').pop();
                let imgBuffer = Buffer.from(base64Image, 'base64');
                3
                // resize 
                sharp(imgBuffer)
                    .webp({ quality: 75, compressionLevel: 7 })
                    .toBuffer()
                    // add new post
                    .then(async (data) => {
                        let newImagebase64 = `data:image/webp;base64,${data.toString('base64')}`

                        await CommentsSchema.findByIdAndUpdate(req.body.comment._id, {
                            $set: {
                                CommentBody: body.commentBody,
                                CommentOwnerName: body.comment.CommentOwnerName,
                                CommentOwnerId: body.comment.CommentOwnerId,
                                CommentOwnerImage: body.comment.CommentOwnerImage,
                                CommentImage: newImagebase64,
                                CommentsLikes: '0',
                                CommentsRePlayTo: body.comment.CommentsRePlayTo,
                                CommentFromPost: body.comment.PostId
                            }
                        })

                        res.status(200).json("done")
                    })
                    .catch(err => console.log(`downisze issue ${err}`))

                res.status(200).json("done")
            }
            else {
                await CommentsSchema.findByIdAndUpdate(req.body.comment._id, {
                    $set: {
                        CommentBody: body.commentBody,
                        CommentOwnerName: body.comment.CommentOwnerName,
                        CommentOwnerId: body.comment.CommentOwnerId,
                        CommentOwnerImage: body.comment.CommentOwnerImage,
                        CommentImage: body.comment.CommentImage,
                        CommentsLikes: '0',
                        CommentsRePlayTo: body.comment.CommentsRePlayTo,
                        CommentFromPost: body.comment.PostId
                    }
                })

                res.status(200).json("done")
            }

        } else {
            return res.status(404).json("you can't update this comment")
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}

