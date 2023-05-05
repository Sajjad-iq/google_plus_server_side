const PostSchema = require('../../Schema/Post')
const AccountSchema = require('../../Schema/Account')


exports.AddLikeHandler = async (req, res) => {

    try {
        const body = req.body
        let CommentsPost = null
        const AccessControlCheck = await AccountSchema.findById(body.AccessControlId).select(["Password"]).lean()

        // delete or add like
        const targetPost = await PostSchema.findByIdAndUpdate(body.PostId,

            req.body.Operation === "delete" ?
                { $pull: { Likes: body.UserId } }
                :
                { $addToSet: { Likes: body.UserId } }

        ).select(
            ["_id", "PostBody", "PostOwnerName", "PostOwnerImage", "PostOwnerId", "PostImage", "Link", "CommentsCounter", "createdAt", "Likes"]
        ).lean(true)


        // return the post to client
        if (body.Operation === "delete" && AccessControlCheck.Password == body.AccessControlPassword) {
            const index = targetPost.Likes.indexOf(body.UserId);
            targetPost.Likes.splice(index, 1);

            res.status(200).json(targetPost)
        }




        //  return the post to client and add notification 
        else if (body.Operation === "add" && AccessControlCheck.Password == body.AccessControlPassword) {

            targetPost.Likes.push(body.UserId)

            // get all notifications in this account
            const Notifications = await AccountSchema.findOne({ _id: body.PostOwnerId }).select(["Notifications"]).lean(true)

            // find the notification object for this post if its exist
            const SpecificNotificationsPost = Notifications.Notifications.filter((e) => {
                if (e.NotificationOration == "comment" && e.NotificationFromId == body.PostId) CommentsPost = e
                return e.NotificationOration == "like" && e.NotificationFromId == body.PostId
            })

            // if the notification object for this post did not exist  ?
            if (SpecificNotificationsPost.length <= 0) {

                // if the notification object for this post don't has comments
                if (!CommentsPost) {
                    await AccountSchema.findByIdAndUpdate(body.PostOwnerId, {
                        $addToSet: {
                            Notifications: {
                                NotificationName: `${body.UserName} ${body.FamilyName}`,
                                NotificationBody: `+1 : ${body.PostBody}`,
                                NotificationFromId: body.PostId,
                                NotificationFrom: "posts",
                                NotificationOration: "like",
                                NotificationOwnerImage: body.NotificationOwnerImage,
                                NotificationUsersIds: body.UserId
                            }
                        }
                    }).select(["UserName"]).lean()
                }


                // if the notification object for this post has comment
                else {

                    // clean the notification object
                    CommentsPost.NotificationOwnerImage = CommentsPost.NotificationOwnerImage.slice(0, 4)
                    CommentsPost.NotificationName = CommentsPost.NotificationName.slice(0, 7)

                    // if the user don't add comments before in this post
                    if (!CommentsPost.NotificationUsersIds.includes(body.UserId)) {
                        CommentsPost.NotificationOwnerImage.unshift(body.NotificationOwnerImage)
                        CommentsPost.NotificationUsersIds.push(body.UserId)
                        CommentsPost.NotificationName.unshift(body.UserName)
                    }

                    // start to modify comments object for this post to be likes object
                    await AccountSchema.updateOne({ _id: body.PostOwnerId }, {
                        $set: {
                            "Notifications.$[el].NotificationName": CommentsPost.NotificationName,
                            "Notifications.$[el].NotificationOwnerImage": CommentsPost.NotificationOwnerImage,
                            "Notifications.$[el].NotificationBody": `+1, Comments on: ${body.PostBody}`,
                            "Notifications.$[el].NotificationFromId": body.PostId,
                            "Notifications.$[el].NotificationOration": "like",
                            "Notifications.$[el].NotificationFrom": 'posts',
                            "Notifications.$[el].NotificationUsersIds": CommentsPost.NotificationUsersIds
                        }
                    },
                        { arrayFilters: [{ "el.NotificationFromId": req.body.PostId, "el.NotificationOration": "comment" }] }
                    )
                }
            }


            // if SpecificNotificationsPost isn't empty ?
            else if (SpecificNotificationsPost.length > 0) {



                // clean the notification object
                SpecificNotificationsPost[0].NotificationOwnerImage = SpecificNotificationsPost[0].NotificationOwnerImage.slice(0, 4)
                SpecificNotificationsPost[0].NotificationName = SpecificNotificationsPost[0].NotificationName.slice(0, 8)

                // if the user don't add Like before in this post
                if (!SpecificNotificationsPost[0].NotificationUsersIds.includes(body.UserId)) {
                    SpecificNotificationsPost[0].NotificationOwnerImage.unshift(body.NotificationOwnerImage)
                    SpecificNotificationsPost[0].NotificationUsersIds.push(body.UserId)
                    SpecificNotificationsPost[0].NotificationName.unshift(body.UserName)
                }

                // start to update Likes object for this post 
                await AccountSchema.updateOne({ _id: body.PostOwnerId }, {
                    $set: {
                        "Notifications.$[el].NotificationName": SpecificNotificationsPost[0].NotificationName,
                        "Notifications.$[el].NotificationOwnerImage": SpecificNotificationsPost[0].NotificationOwnerImage,
                        "Notifications.$[el].NotificationBody": CommentsPost ? `+1, Comments on:${body.PostBody}` : `+1 :${body.PostBody}`,
                        "Notifications.$[el].NotificationFromId": body.PostId,
                        "Notifications.$[el].NotificationOration": "like",
                        "Notifications.$[el].NotificationFrom": 'posts',
                        "Notifications.$[el].NotificationUsersIds": SpecificNotificationsPost[0].NotificationUsersIds
                    }
                },
                    { arrayFilters: [{ "el.NotificationFromId": req.body.PostId, "el.NotificationOration": "like" }] }
                )



                // delete comments object for this post 
                if (CommentsPost) {
                    await AccountSchema.updateOne(
                        { _id: body.PostOwnerId },
                        { $pull: { Notifications: { NotificationFromId: req.body.PostId, NotificationOration: "comment" } } }
                    )
                }

            }
            res.status(200).json(targetPost)
        }


    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}

