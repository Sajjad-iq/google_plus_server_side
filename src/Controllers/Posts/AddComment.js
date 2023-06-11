const PostSchema = require('../../Schema/Post')
const CommentsSchema = require('../../Schema/Comments')
const NotificationsSchema = require("../../Schema/Notifications")

const sharp = require('sharp');

async function AddComment(body, CommentImage) {

    const Comment = new CommentsSchema({
        CommentBody: body.Comment.CommentBody,
        CommentOwnerName: body.Comment.CommentOwnerName,
        CommentOwnerId: body.Comment.CommentOwnerId,
        CommentOwnerImage: body.Comment.CommentOwnerImage,
        CommentImage: CommentImage,
        CommentsLikes: '0',
        CommentsRePlayTo: body.Comment.CommentsRePlayTo,
        CommentFromPost: body.Comment.PostId
    })

    await PostSchema.updateOne({ _id: body.Comment.PostId }, {
        $inc: { CommentsCounter: 1 }
    }).lean().select(["_id"])

    await Comment.save()
}

exports.AddCommentHandler = async (req, res) => {

    const body = req.body
    let LikesPost = null

    try {

        // check the access
        if (req.session.UserId) {


            if (body.Comment.CommentImage !== "") {

                // convert from base64 
                let base64Image = body.Comment.CommentImage.split(';base64,').pop();
                let imgBuffer = Buffer.from(base64Image, 'base64');

                // resize 
                sharp(imgBuffer)
                    .webp({ quality: 75, compressionLevel: 7 })
                    .toBuffer()
                    // add new comment 
                    .then(async (data) => {
                        let newImagebase64 = `data:image/webp;base64,${data.toString('base64')}`
                        AddComment(body, newImagebase64)
                    })
                    .catch(err => console.log(`downisze issue ${err}`))
            } else {
                AddComment(body, "")
            }


            /////// notifications part

            // get all notifications in this account
            const NotificationsArr = await NotificationsSchema.find({
                NotificationByAccount: body.Comment.CommentsRePlayToId !== "" ? body.Comment.CommentsRePlayToId : body.Comment.PostOwnerId,
                NotificationOnClickTargetId: body.Comment.PostId
            })

            // find the notification object for this post if its exist
            const NotificationsFilter = NotificationsArr.filter((e) => {
                if (e.NotificationOration == "like") LikesPost = e
                return e.NotificationOration == "comment"
            })



            // if it's normal comment

            if (body.Comment.PostOwnerId !== body.Comment.CommentOwnerId || body.Comment.CommentsRePlayToId !== "") {

                // if the notification object for this post did not exist  ?
                if (NotificationsFilter.length <= 0) {

                    // if the notification object for this post don't has likes
                    if (!LikesPost) {
                        const NewNotification = new NotificationsSchema({
                            NotificationName: [`${body.Data.UserName} ${body.Data.FamilyName}`],
                            NotificationBody: body.Comment.CommentsRePlayToId == "" ? `Comment on: ${body.Data.PostBody}` : `Mentioned you on: ${body.Data.PostBody}`,
                            NotificationOnClickTargetId: body.Comment.PostId,
                            NotificationFrom: "posts",
                            NotificationOration: "comment",
                            NotificationUsersIncludedImages: [body.Comment.CommentOwnerImage],
                            NotificationUsersIncludedIds: [body.Comment.CommentOwnerId],
                            NotificationByAccount: body.Comment.CommentsRePlayToId !== "" ? body.Comment.CommentsRePlayToId : body.Comment.PostOwnerId
                            , Read: false

                        })
                        await NewNotification.save()
                    }


                    // if the notification object for this post has likes
                    else {

                        // clean the notification object
                        LikesPost.NotificationUsersIncludedImages = LikesPost.NotificationUsersIncludedImages.slice(0, 4)
                        LikesPost.NotificationName = LikesPost.NotificationName.slice(0, 8)

                        // if the user don't add likes before in this post
                        if (!LikesPost.NotificationUsersIncludedIds.includes(body.Comment.CommentOwnerId)) {
                            LikesPost.NotificationUsersIncludedImages.unshift(body.Comment.CommentOwnerImage)
                            LikesPost.NotificationUsersIncludedIds.push(body.Comment.CommentOwnerId)
                            LikesPost.NotificationName.unshift(body.Data.UserName)
                        }

                        // start to modify likes object for this post to be comments object
                        await NotificationsSchema.updateOne({
                            NotificationByAccount: body.Comment.CommentsRePlayToId !== "" ? body.Comment.CommentsRePlayToId : body.Comment.PostOwnerId,
                            NotificationOnClickTargetId: body.Comment.PostId,
                            NotificationOration: "like"
                        }, {
                            $set: {
                                NotificationName: LikesPost.NotificationName,
                                NotificationUsersIncludedImages: LikesPost.NotificationUsersIncludedImages,
                                NotificationBody: body.Comment.CommentsRePlayToId == "" ? `Comments,+1 on: ${body.Data.PostBody}` : `Mentioned you on,+1 on: ${body.Data.PostBody}`,
                                NotificationOnClickTargetId: body.Comment.PostId,
                                NotificationByAccount: body.Comment.CommentsRePlayToId !== "" ? body.Comment.CommentsRePlayToId : body.Comment.PostOwnerId,
                                NotificationOration: "comment",
                                NotificationFrom: 'posts',
                                NotificationUsersIncludedIds: LikesPost.NotificationUsersIncludedIds
                                , Read: false

                            }
                        }
                        )
                    }
                }





                // if SpecificNotificationsPost isn't empty ?
                else if (NotificationsFilter.length > 0) {

                    const TargetNotification = NotificationsFilter[0]

                    // clean the notification object
                    TargetNotification.NotificationUsersIncludedImages = TargetNotification.NotificationUsersIncludedImages.slice(0, 4)
                    TargetNotification.NotificationName = TargetNotification.NotificationName.slice(0, 8)

                    // if the user don't add comments before in this post
                    if (!TargetNotification.NotificationUsersIncludedIds.includes(body.Comment.CommentOwnerId)) {
                        TargetNotification.NotificationUsersIncludedImages.unshift(body.Comment.CommentOwnerImage)
                        TargetNotification.NotificationUsersIncludedIds.push(body.Comment.CommentOwnerId)
                        TargetNotification.NotificationName.unshift(body.Data.UserName)
                    }

                    // start to update comments object for this post 

                    await NotificationsSchema.updateOne({
                        NotificationByAccount: body.Comment.CommentsRePlayToId !== "" ? body.Comment.CommentsRePlayToId : body.Comment.PostOwnerId,
                        NotificationOnClickTargetId: body.Comment.PostId,
                        NotificationOration: "comment"
                    }, {
                        $set: {
                            NotificationName: TargetNotification.NotificationName,
                            NotificationUsersIncludedImages: TargetNotification.NotificationUsersIncludedImages,
                            NotificationBody: body.Comment.CommentsRePlayToId == "" ? LikesPost ? `Comments, +1 on:${body.Data.PostBody}` : `Comments on:${body.Data.PostBody}` : LikesPost ? `Mentioned you on, +1 on:${body.Data.PostBody}` : `Mentioned you on:${body.Data.PostBody}`,
                            NotificationOnClickTargetId: body.Comment.PostId,
                            NotificationByUserAccount: body.Comment.CommentsRePlayToId !== "" ? body.Comment.CommentsRePlayToId : body.Comment.PostOwnerId,
                            NotificationOration: "comment",
                            NotificationFrom: 'posts',
                            NotificationUsersIncludedIds: TargetNotification.NotificationUsersIncludedIds
                            , Read: false

                        }
                    }
                    )
                    // delete likes object for this post 
                    if (LikesPost) {
                        await NotificationsSchema.findOneAndDelete({
                            NotificationByAccount: body.Comment.CommentsRePlayToId !== "" ? body.Comment.CommentsRePlayToId : body.Comment.PostOwnerId,
                            NotificationOnClickTargetId: body.Comment.PostId,
                            NotificationOration: "like"
                        })
                    }
                }

            }

            res.status(200).json("done !")
        } else return res.status(404).json("you don't sign in")
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}






