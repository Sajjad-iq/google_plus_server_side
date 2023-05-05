const PostSchema = require('../../Schema/Post')
const AccountSchema = require('../../Schema/Account')

exports.AddCommentHandler = async (req, res) => {

    const body = req.body
    let LikesPost = null


    try {

        const targetPost = await PostSchema.findByIdAndUpdate(body.Comment.PostId, {
            $push: { Comments: body.Comment },
            $set: { CommentsCounter: body.Comment.CommentsCounter }
        }).lean()


        // if it's normal comment

        if (targetPost.PostOwnerId !== body.Comment.CommentOwnerId && body.Comment.CommentsRePlayTo === "") {


            // get all notifications in this account
            const Notifications = await AccountSchema.findOne({ _id: body.Comment.PostOwnerId }).select(["Notifications"]).lean(true)

            // find the notification object for this post if its exist
            const SpecificNotificationsPost = Notifications.Notifications.filter((e) => {
                if (e.NotificationOration == "like" && e.NotificationFromId == body.Comment.PostId) LikesPost = e
                return e.NotificationOration == "comment" && e.NotificationFromId == body.Comment.PostId
            })


            // if the notification object for this post did not exist  ?
            if (SpecificNotificationsPost.length <= 0) {

                // if the notification object for this post don't has likes
                if (!LikesPost) {

                    await AccountSchema.findByIdAndUpdate(body.Comment.PostOwnerId, {
                        $addToSet: {
                            Notifications: {
                                NotificationName: `${body.Data.UserName} ${body.Data.FamilyName}`,
                                NotificationBody: `Comment on: ${body.Data.PostBody}`,
                                NotificationFromId: body.Comment.PostId,
                                NotificationFrom: "posts",
                                NotificationOration: "comment",
                                NotificationOwnerImage: body.Comment.CommentOwnerImage,
                                NotificationUsersIds: body.Comment.CommentOwnerId
                            }
                        }
                    }).lean()
                }


                // if the notification object for this post has likes
                else {

                    // clean the notification object
                    LikesPost.NotificationOwnerImage = LikesPost.NotificationOwnerImage.slice(0, 3)
                    LikesPost.NotificationName = LikesPost.NotificationName.slice(0, 8)

                    // if the user don't add likes before in this post
                    if (!LikesPost.NotificationUsersIds.includes(body.Comment.CommentOwnerId)) {
                        LikesPost.NotificationOwnerImage.unshift(body.Comment.CommentOwnerImage)
                        LikesPost.NotificationUsersIds.push(body.Comment.CommentOwnerId)
                        LikesPost.NotificationName.unshift(body.Data.UserName)
                    }

                    // start to modify likes object for this post to be comments object
                    await AccountSchema.updateOne({ _id: body.Comment.PostOwnerId }, {
                        $set: {
                            "Notifications.$[el].NotificationName": LikesPost.NotificationName,
                            "Notifications.$[el].NotificationOwnerImage": LikesPost.NotificationOwnerImage,
                            "Notifications.$[el].NotificationBody": `Comments,+1 on: ${body.Data.PostBody}`,
                            "Notifications.$[el].NotificationFromId": body.Comment.PostId,
                            "Notifications.$[el].NotificationOration": "comment",
                            "Notifications.$[el].NotificationFrom": 'posts',
                            "Notifications.$[el].NotificationUsersIds": LikesPost.NotificationUsersIds
                        }
                    },
                        { arrayFilters: [{ "el.NotificationFromId": body.Comment.PostId, "el.NotificationOration": "like" }] }
                    )
                }
            }





            // if SpecificNotificationsPost isn't empty ?
            else if (SpecificNotificationsPost.length > 0) {

                // clean the notification object
                SpecificNotificationsPost[0].NotificationOwnerImage = SpecificNotificationsPost[0].NotificationOwnerImage.slice(0, 3)
                SpecificNotificationsPost[0].NotificationName = SpecificNotificationsPost[0].NotificationName.slice(0, 8)

                // if the user don't add comments before in this post
                if (!SpecificNotificationsPost[0].NotificationUsersIds.includes(body.Comment.CommentOwnerId)) {
                    SpecificNotificationsPost[0].NotificationOwnerImage.unshift(body.Comment.CommentOwnerImage)
                    SpecificNotificationsPost[0].NotificationUsersIds.push(body.Comment.CommentOwnerId)
                    SpecificNotificationsPost[0].NotificationName.unshift(body.Data.UserName)
                }

                // start to update comments object for this post 
                await AccountSchema.updateOne({ _id: body.Comment.PostOwnerId }, {
                    $set: {
                        "Notifications.$[el].NotificationName": SpecificNotificationsPost[0].NotificationName,
                        "Notifications.$[el].NotificationOwnerImage": SpecificNotificationsPost[0].NotificationOwnerImage,
                        "Notifications.$[el].NotificationBody": LikesPost ? `Comments, +1 on:${body.Data.PostBody}` : `Comments on:${body.Data.PostBody}`,
                        "Notifications.$[el].NotificationFromId": body.Comment.PostId,
                        "Notifications.$[el].NotificationOration": "comment",
                        "Notifications.$[el].NotificationFrom": 'posts',
                        "Notifications.$[el].NotificationUsersIds": SpecificNotificationsPost[0].NotificationUsersIds
                    }
                },
                    { arrayFilters: [{ "el.NotificationFromId": body.Comment.PostId, "el.NotificationOration": "comment" }] }
                )

                // delete likes object for this post 
                if (LikesPost) {
                    await AccountSchema.updateOne(
                        { _id: body.Comment.PostOwnerId },
                        { $pull: { Notifications: { NotificationFromId: body.Comment.PostId, NotificationOration: "like" } } }
                    )
                }
            }

        }



        // if it's replay comment

        else if ((body.Comment.CommentsRePlayTo !== "" && body.Comment.CommentsRePlayToId !== "")) {

            let isOwner = body.Comment.CommentsRePlayToId === body.Comment.PostOwnerId ? true : false

            // get all notifications in this account
            const Notifications = await AccountSchema.findOne({ _id: body.Comment.CommentsRePlayToId }).select(["Notifications"]).lean(true)

            // find the notification object for this post if its exist
            const SpecificNotificationsPost = Notifications.Notifications.filter((e) => {
                if (e.NotificationOration == "like" && e.NotificationFromId == body.Comment.PostId) LikesPost = e
                return e.NotificationOration == "comment" && e.NotificationFromId == body.Comment.PostId
            })

            // if SpecificNotificationsPost empty  ?
            if (SpecificNotificationsPost.length <= 0) {

                // if the notification object for this post don't has likes
                if (!LikesPost) {
                    await AccountSchema.findByIdAndUpdate(body.Comment.CommentsRePlayToId, {
                        $addToSet: {
                            Notifications: {
                                NotificationName: `${body.Data.UserName} ${body.Data.FamilyName}`,
                                NotificationBody: `Mentioned you on: ${body.Data.PostBody}`,
                                NotificationFromId: body.Comment.PostId,
                                NotificationFrom: "posts",
                                NotificationOration: "comment",
                                NotificationOwnerImage: body.Comment.CommentOwnerImage,
                                NotificationUsersIds: body.Comment.CommentOwnerId
                            }
                        }
                    })
                }


                // if the notification object for this post has likes
                else {

                    // clean the notification object
                    LikesPost.NotificationOwnerImage = LikesPost.NotificationOwnerImage.slice(0, 3)
                    LikesPost.NotificationName = LikesPost.NotificationName.slice(0, 8)

                    // if the user don't add likes before in this post
                    if (!LikesPost.NotificationUsersIds.includes(body.Comment.CommentOwnerId)) {
                        LikesPost.NotificationOwnerImage.unshift(body.Comment.CommentOwnerImage)
                        LikesPost.NotificationUsersIds.push(body.Comment.CommentOwnerId)
                        LikesPost.NotificationName.unshift(body.Data.UserName)
                    }

                    // start to modify likes object for this post to be comments object
                    await AccountSchema.updateOne({ _id: body.Comment.CommentsRePlayToId }, {
                        $set: {
                            "Notifications.$[el].NotificationName": isOwner ? LikesPost.NotificationName : body.Comment.CommentOwnerImage,
                            "Notifications.$[el].NotificationOwnerImage": isOwner ? LikesPost.NotificationOwnerImage : body.Comment.CommentOwnerImage,
                            "Notifications.$[el].NotificationBody": isOwner ? `Mentioned you,+1 on: ${body.Data.PostBody}` : `Mentioned you on: ${body.Data.PostBody} `,
                            "Notifications.$[el].NotificationFromId": body.Comment.PostId,
                            "Notifications.$[el].NotificationOration": "comment",
                            "Notifications.$[el].NotificationFrom": 'posts',
                            "Notifications.$[el].NotificationUsersIds": isOwner ? LikesPost.NotificationUsersIds : body.Comment.CommentOwnerId
                        }
                    },
                        { arrayFilters: [{ "el.NotificationFromId": body.Comment.PostId, "el.NotificationOration": "like" }] }
                    )
                }
            }

            // if SpecificNotificationsPost isn't empty ?

            else if (SpecificNotificationsPost.length > 0) {

                // clean the notification object
                SpecificNotificationsPost[0].NotificationOwnerImage = SpecificNotificationsPost[0].NotificationOwnerImage.slice(0, 3)
                SpecificNotificationsPost[0].NotificationName = SpecificNotificationsPost[0].NotificationName.slice(0, 8)

                // if the user don't add comments before in this post
                if (!SpecificNotificationsPost[0].NotificationUsersIds.includes(body.Comment.CommentOwnerId)) {
                    SpecificNotificationsPost[0].NotificationOwnerImage.unshift(body.Comment.CommentOwnerImage)
                    SpecificNotificationsPost[0].NotificationUsersIds.push(body.Comment.CommentOwnerId)
                    SpecificNotificationsPost[0].NotificationName.unshift(body.Data.UserName)
                }


                // start to update comments object for this post 
                await AccountSchema.updateOne({ _id: body.Comment.CommentsRePlayToId }, {
                    $set: {
                        "Notifications.$[el].NotificationName": isOwner ? SpecificNotificationsPost[0].NotificationName : body.Comment.CommentOwnerImage,
                        "Notifications.$[el].NotificationOwnerImage": isOwner ? SpecificNotificationsPost[0].NotificationOwnerImage : body.Comment.CommentOwnerImage,
                        "Notifications.$[el].NotificationBody": isOwner ? LikesPost ? `Mentioned you,+1 on: ${body.Data.PostBody}` : `Mentioned you on: ${body.Data.PostBody}` : `Mentioned you:${body.Data.PostBody}`,
                        "Notifications.$[el].NotificationFromId": body.Comment.PostId,
                        "Notifications.$[el].NotificationOration": "comment",
                        "Notifications.$[el].NotificationFrom": 'posts',
                        "Notifications.$[el].NotificationUsersIds": SpecificNotificationsPost[0].NotificationUsersIds
                    }
                },
                    { arrayFilters: [{ "el.NotificationFromId": body.Comment.PostId, "el.NotificationOration": "comment" }] }
                )

                // delete likes object for this post 
                if (LikesPost) {
                    await AccountSchema.updateOne(
                        { _id: body.Comment.CommentsRePlayToId },
                        { $pull: { Notifications: { NotificationFromId: body.Comment.PostId, NotificationOration: "like" } } }
                    )
                }
            }

        }


        res.status(200).json(targetPost.Comments.length)

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}






