const PostSchema = require('../../Schema/Post')
const NotificationsSchema = require("../../Schema/Notifications")


exports.AddLikeHandler = async (req, res) => {




    try {
        const body = req.body
        let CommentsPost = null

        if (req.session.UserId) {
            // delete or add like
            const targetPost = await PostSchema.findByIdAndUpdate(body.PostId,

                req.body.Operation === "delete" ?
                    { $pull: { Likes: body.UserId } }
                    :
                    { $addToSet: { Likes: body.UserId } }

            ).select(
                ["_id", "PostBody", "PostOwnerName", "PostOwnerImage", "PostOwnerId", "PostImage", "Link", "CommentsCounter", "createdAt", "Likes", "PostFrom", "CollectionName", "CollectionId", "PrivateShareUsersIds", "CollectionOwnerId"]
            ).lean(true)


            // return the post to client
            if (body.Operation === "delete" && req.session.UserId) {
                const index = targetPost.Likes.indexOf(body.UserId);
                targetPost.Likes.splice(index, 1);

                res.status(200).json(targetPost)
            }




            //  return the post to client and add notification 
            else if (body.Operation === "add" && req.session.UserId) {

                targetPost.Likes.push(body.UserId)

                // get all notifications in this account
                const NotificationsArr = await NotificationsSchema.find({
                    NotificationByAccount: body.PostOwnerId,
                    NotificationOnClickTargetId: body.PostId
                })

                // find the notification object for this post if its exist
                const NotificationsFilter = NotificationsArr.filter((e) => {
                    if (e.NotificationOration == "like") CommentsPost = e
                    return e.NotificationOration == "comment"
                })


                // if the notification object for this post did not exist  ?
                if (NotificationsFilter.length <= 0) {

                    // if the notification object for this post don't has comments
                    if (!CommentsPost) {
                        const NewNotification = new NotificationsSchema({
                            NotificationName: [`${body.UserName} ${body.FamilyName}`],
                            NotificationBody: `+1 : ${body.PostBody}`,
                            NotificationOnClickTargetId: body.PostId,
                            NotificationFrom: "posts",
                            NotificationOration: "like",
                            NotificationUsersIncludedImages: [body.NotificationOwnerImage],
                            NotificationUsersIncludedIds: [body.UserId],
                            NotificationByAccount: body.PostOwnerId
                            , Read: false

                        })
                        await NewNotification.save()
                    }


                    // if the notification object for this post has comment
                    else {

                        // clean the notification object
                        CommentsPost.NotificationUsersIncludedImages = CommentsPost.NotificationUsersIncludedImages.slice(0, 4)
                        CommentsPost.NotificationName = CommentsPost.NotificationName.slice(0, 7)

                        // if the user don't add comments before in this post
                        if (!CommentsPost.NotificationUsersIncludedIds.includes(body.UserId)) {
                            CommentsPost.NotificationUsersIncludedImages.unshift(body.NotificationOwnerImage)
                            CommentsPost.NotificationUsersIncludedIds.push(body.UserId)
                            CommentsPost.NotificationName.unshift(body.UserName)
                        }

                        // start to modify comments object for this post to be likes object

                        await NotificationsSchema.updateOne({
                            NotificationByAccount: body.PostOwnerId,
                            NotificationOnClickTargetId: body.PostId,
                            NotificationOration: "comment"
                        }, {
                            $set: {
                                NotificationName: CommentsPost.NotificationName,
                                NotificationUsersIncludedImages: CommentsPost.NotificationUsersIncludedImages,
                                NotificationBody: `+1, Comments on: ${body.PostBody}`,
                                NotificationOnClickTargetId: body.PostId,
                                NotificationByUserAccount: body.PostOwnerId,
                                NotificationOration: "like",
                                NotificationFrom: 'posts',
                                NotificationUsersIncludedIds: CommentsPost.NotificationUsersIncludedIds
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

                    // if the user don't add Like before in this post
                    if (!TargetNotification.NotificationUsersIncludedIds.includes(body.UserId)) {
                        TargetNotification.NotificationUsersIncludedImages.unshift(body.NotificationOwnerImage)
                        TargetNotification.NotificationUsersIncludedIds.push(body.UserId)
                        TargetNotification.NotificationName.unshift(body.UserName)
                    }

                    // start to update Likes object for this post 

                    await NotificationsSchema.updateOne({
                        NotificationByAccount: body.PostOwnerId,
                        NotificationOnClickTargetId: body.PostId,
                        NotificationOration: "comment"
                    }, {
                        $set: {
                            NotificationName: TargetNotification.NotificationName,
                            NotificationUsersIncludedImages: TargetNotification.NotificationUsersIncludedImages,
                            NotificationBody: CommentsPost ? `+1, Comments on:${body.PostBody}` : `+1 :${body.PostBody}`,
                            NotificationOnClickTargetId: body.PostId,
                            NotificationByUserAccount: body.PostOwnerId,
                            NotificationOration: "like",
                            NotificationFrom: 'posts',
                            NotificationUsersIncludedIds: TargetNotification.NotificationUsersIncludedIds
                            , Read: false

                        }
                    }
                    )

                    // delete comments object for this post 
                    if (CommentsPost) {
                        await NotificationsSchema.findOneAndDelete({
                            NotificationByAccount: body.PostOwnerId,
                            NotificationOnClickTargetId: body.PostId,
                            NotificationOration: "comment"
                        })
                    }

                }
                res.status(200).json(targetPost)
            }

        } else return res.status(404).json("your don't sign in")
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}

