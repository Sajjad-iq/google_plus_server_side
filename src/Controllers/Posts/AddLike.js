const PostSchema = require('../../Schema/Post')
const AccountSchema = require('../../Schema/Account')


exports.AddLikeHandler = async (req, res) => {

    try {
        const body = req.body

        const targetPost = await PostSchema.findByIdAndUpdate(body.PostId,

            req.body.Operation === "delete" ?
                { $pull: { Likes: body.UserId } }
                :
                { $addToSet: { Likes: body.UserId } }

        ).select(
            ["_id", "PostBody", "PostOwnerName", "PostOwnerImage", "PostOwnerId", "PostImage", "Link", "CommentsCounter", "createdAt", "Likes"]
        ).lean(true)


        if (body.Operation === "delete") {
            const index = targetPost.Likes.indexOf(body.UserId);
            targetPost.Likes.splice(index, 1);

            res.status(200).json(targetPost)
        }
        else {

            targetPost.Likes.push(body.UserId)

            // get all notifications in this account
            const Notifications = await AccountSchema.findOne({ _id: body.PostOwnerId }).select(["Notifications"]).lean(true)


            // filter them by 
            const SpecificNotificationsPost = Notifications.Notifications.filter((e) => {
                return e.NotificationOration == "like" && e.NotificationFromId == body.PostId
            })


            // if SpecificNotificationsPost empty  ?
            if (SpecificNotificationsPost.length <= 0) {
                await AccountSchema.findByIdAndUpdate(body.PostOwnerId, {
                    $addToSet: {
                        Notifications: {
                            NotificationName: `${body.UserName} ${body.FamilyName}`,
                            NotificationBody: `Likes your post on: ${body.PostBody}`,
                            NotificationFromId: body.PostId,
                            NotificationFrom: "posts",
                            NotificationOration: "like",
                            NotificationOwnerImage: body.NotificationOwnerImage || "",
                            NotificationUsersIds: body.UserId
                        }
                    }
                }).select(["UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin"]).lean()

            }



            // if SpecificNotificationsPost isn't empty ?

            else if (SpecificNotificationsPost[0].NotificationUsersIds.length >= 1 && !SpecificNotificationsPost[0].NotificationUsersIds.includes(body.UserId)) {

                SpecificNotificationsPost[0].NotificationOwnerImage.unshift(body.NotificationOwnerImage)
                SpecificNotificationsPost[0].NotificationUsersIds.push(body.UserId)
                SpecificNotificationsPost[0].NotificationName = SpecificNotificationsPost[0].NotificationUsersIds.length > 6 ? `${body.UserName}, ${SpecificNotificationsPost[0].NotificationName}  and ${SpecificNotificationsPost[0].NotificationUsersIds.length} others` : `${body.UserName}, ${SpecificNotificationsPost[0].NotificationName}`

                await AccountSchema.updateOne({ "Notifications.NotificationFromId": req.body.PostId, "Notifications.NotificationOration": "like" }, {
                    $set: {
                        "Notifications.$[el].NotificationName": SpecificNotificationsPost[0].NotificationName,
                        "Notifications.$[el].NotificationOwnerImage": SpecificNotificationsPost[0].NotificationOwnerImage !== "" ? SpecificNotificationsPost[0].NotificationOwnerImage : "",
                        "Notifications.$[el].NotificationBody": `Likes your post on: ${body.PostBody}`,
                        "Notifications.$[el].NotificationFromId": body.PostId,
                        "Notifications.$[el].NotificationOration": "like",
                        "Notifications.$[el].NotificationFrom": 'posts',
                        "Notifications.$[el].NotificationUsersIds": SpecificNotificationsPost[0].NotificationUsersIds
                    }
                },
                    { arrayFilters: [{ "el.NotificationFromId": req.body.PostId, "el.NotificationOration": "like" }] }
                )

            }
            res.status(200).json(targetPost)
        }


    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}


