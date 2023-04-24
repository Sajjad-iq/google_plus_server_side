const PostSchema = require('../../Schema/Post')
const AccountSchema = require('../../Schema/Account')

exports.AddCommentHandler = async (req, res) => {

    const body = req.body

    try {
        const targetPost = await PostSchema.findByIdAndUpdate(body.Comment.PostId, {
            $push: { Comments: body.Comment },
            $set: { CommentsCounter: body.Comment.CommentsCounter }
        }).lean()

        // if it's normal comment
        if (targetPost.PostOwnerId !== body.Comment.CommentOwnerId && body.Comment.CommentsRePlayTo === "") {

            // get all notifications in this account
            const Notifications = await AccountSchema.findOne({ _id: body.Comment.PostOwnerId }).select(["Notifications"]).lean(true)

            // filter them by 
            const SpecificNotificationsPost = Notifications.Notifications.filter((e) => {
                return e.NotificationOration == "comment" && e.NotificationFromId == body.Comment.PostId
            })

            // if SpecificNotificationsPost empty  ?
            if (SpecificNotificationsPost.length <= 0) {
                await AccountSchema.findByIdAndUpdate(body.Comment.PostOwnerId, {
                    $addToSet: {
                        Notifications: {
                            NotificationName: `${body.Data.UserName} ${body.Data.FamilyName}`,
                            NotificationBody: `Add Comment to your post on: ${body.Data.PostBody}`,
                            NotificationFromId: body.Comment.PostId,
                            NotificationFrom: "posts",
                            NotificationOration: "comment",
                            NotificationOwnerImage: body.Comment.CommentOwnerImage || "",
                            NotificationUsersIds: body.Comment.CommentOwnerId
                        }
                    }
                })
            }

            // if SpecificNotificationsPost isn't empty ?

            else if (SpecificNotificationsPost[0].NotificationUsersIds.length >= 1) {

                if (SpecificNotificationsPost[0].NotificationUsersIds.includes(body.Comment.CommentOwnerId)) {
                    if (SpecificNotificationsPost[0].NotificationUsersIds.length > 4) {
                        SpecificNotificationsPost[0].NotificationOwnerImage.unshift(body.Comment.CommentOwnerImage)
                        SpecificNotificationsPost[0].NotificationName = SpecificNotificationsPost[0].NotificationUsersIds.length > 6 ? `${body.Data.UserName}, ${SpecificNotificationsPost[0].NotificationName} and ${SpecificNotificationsPost[0].NotificationUsersIds.length} others` : `${body.Data.UserName}, ${SpecificNotificationsPost[0].NotificationName}`
                    }
                } else {
                    SpecificNotificationsPost[0].NotificationUsersIds.push(body.Comment.CommentOwnerId)
                    SpecificNotificationsPost[0].NotificationOwnerImage.unshift(body.Comment.CommentOwnerImage)
                    SpecificNotificationsPost[0].NotificationName = SpecificNotificationsPost[0].NotificationUsersIds.length > 6 ? `${body.Data.UserName}, ${SpecificNotificationsPost[0].NotificationName} and ${SpecificNotificationsPost[0].NotificationUsersIds.length} others` : `${body.Data.UserName}, ${SpecificNotificationsPost[0].NotificationName}`
                }

                await AccountSchema.updateOne({ "Notifications.NotificationFromId": body.Comment.PostId, "Notifications.NotificationOration": "comment" }, {
                    $set: {
                        "Notifications.$[el].NotificationName": SpecificNotificationsPost[0].NotificationName,
                        "Notifications.$[el].NotificationOwnerImage": SpecificNotificationsPost[0].NotificationOwnerImage !== "" ? SpecificNotificationsPost[0].NotificationOwnerImage : "",
                        "Notifications.$[el].NotificationBody": `Add Comments in your post on: ${body.Data.PostBody}`,
                        "Notifications.$[el].NotificationFromId": body.Comment.PostId,
                        "Notifications.$[el].NotificationOration": "comment",
                        "Notifications.$[el].NotificationFrom": 'posts',
                        "Notifications.$[el].NotificationUsersIds": SpecificNotificationsPost[0].NotificationUsersIds
                    }
                },
                    { arrayFilters: [{ "el.NotificationFromId": body.Comment.PostId, "el.NotificationOration": "comment" }] }
                )
            }

        }



        // if it's replay comment

        else if ((body.Comment.CommentsRePlayTo !== "" && body.Comment.CommentsRePlayToId !== "")) {

            // get all notifications in this account
            const Notifications = await AccountSchema.findOne({ _id: body.Comment.CommentsRePlayToId }).select(["Notifications"]).lean(true)

            // filter them by 
            const SpecificNotificationsPost = Notifications.Notifications.filter((e) => {
                return e.NotificationOration == "comment replay" && e.NotificationFromId == body.Comment.PostId
            })

            // if SpecificNotificationsPost empty  ?
            if (SpecificNotificationsPost.length <= 0) {
                await AccountSchema.findByIdAndUpdate(body.Comment.CommentsRePlayToId, {
                    $addToSet: {
                        Notifications: {
                            NotificationName: `${body.Data.UserName} ${body.Data.FamilyName}`,
                            NotificationBody: `Mentioned you on: ${body.Data.PostBody}`,
                            NotificationFromId: body.Comment.PostId,
                            NotificationFrom: "posts",
                            NotificationOration: "comment replay",
                            NotificationOwnerImage: body.Comment.CommentOwnerImage || "",
                            NotificationUsersIds: body.Comment.CommentOwnerId
                        }
                    }
                })
            }

            // if SpecificNotificationsPost isn't empty ?

            else if (SpecificNotificationsPost[0].NotificationUsersIds.length >= 1) {

                if (SpecificNotificationsPost[0].NotificationUsersIds.includes(body.Comment.CommentOwnerId)) {
                    if (SpecificNotificationsPost[0].NotificationUsersIds.length > 4) {
                        SpecificNotificationsPost[0].NotificationOwnerImage.unshift(body.Comment.CommentOwnerImage)
                        SpecificNotificationsPost[0].NotificationName = SpecificNotificationsPost[0].NotificationUsersIds.length > 6 ? `${body.Data.UserName}, ${SpecificNotificationsPost[0].NotificationName} and ${SpecificNotificationsPost[0].NotificationUsersIds.length} others` : `${body.Data.UserName}, ${SpecificNotificationsPost[0].NotificationName}`
                    }
                } else {
                    SpecificNotificationsPost[0].NotificationUsersIds.push(body.Comment.CommentOwnerId)
                    SpecificNotificationsPost[0].NotificationOwnerImage.unshift(body.Comment.CommentOwnerImage)
                    SpecificNotificationsPost[0].NotificationName = SpecificNotificationsPost[0].NotificationUsersIds.length > 6 ? `${body.Data.UserName}, ${SpecificNotificationsPost[0].NotificationName} and ${SpecificNotificationsPost[0].NotificationUsersIds.length} others` : `${body.Data.UserName}, ${SpecificNotificationsPost[0].NotificationName}`
                }

                await AccountSchema.updateOne({ "Notifications.NotificationFromId": body.Comment.PostId, "Notifications.NotificationOration": "comment replay" }, {
                    $set: {
                        "Notifications.$[el].NotificationName": SpecificNotificationsPost[0].NotificationName,
                        "Notifications.$[el].NotificationOwnerImage": SpecificNotificationsPost[0].NotificationOwnerImage !== "" ? SpecificNotificationsPost[0].NotificationOwnerImage : "",
                        "Notifications.$[el].NotificationBody": `Mentioned you on: ${body.Data.PostBody}`,
                        "Notifications.$[el].NotificationFromId": body.Comment.PostId,
                        "Notifications.$[el].NotificationOration": "comment replay",
                        "Notifications.$[el].NotificationFrom": 'posts',
                        "Notifications.$[el].NotificationUsersIds": SpecificNotificationsPost[0].NotificationUsersIds
                    }
                },
                    { arrayFilters: [{ "el.NotificationFromId": body.Comment.PostId, "el.NotificationOration": "comment replay" }] }
                )
            }

        }


        res.status(200).json(targetPost.Comments.length)

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}






