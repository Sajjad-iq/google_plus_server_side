const Account = require('../../Schema/Account')



exports.AddFollowersHandler = async (req, res) => {

    try {
        const body = req.body

        // if it's  UnFollow operation
        if (body.operation === "remove") {

            // remove user id in the target user object 
            const User = await Account.findByIdAndUpdate(body.FindUserId, {
                $pull: { Followers: body.OwnerId }
            }).select(["_id", "UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin"]).lean()

            // remove in my account
            await Account.findByIdAndUpdate(body.OwnerId, {
                $pull: {
                    Following: {
                        FollowingName: `${User.UserName} ${User.FamilyName}`,
                        FollowingId: body.FindUserId,
                        FollowingImage: User.ProfilePicture
                    }
                }
            }).select(["UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin"]).lean()
            res.status(200).json(-1)
        }





        // if it's add follow operation
        else {

            //add and get all notifications in target user account
            const User = await Account.findByIdAndUpdate(body.FindUserId, {
                $addToSet: {
                    Followers: body.OwnerId,
                }
            }).select(["Notifications", "UserName", "FamilyName", "ProfilePicture"]).lean(true)

            //update my account
            await Account.findByIdAndUpdate(req.body.OwnerId, {
                $addToSet: {
                    Following: {
                        FollowingName: `${User.UserName} ${User.FamilyName}`,
                        FollowingId: req.body.FindUserId,
                        FollowingImage: User.ProfilePicture
                    }
                }
            }).select(["UserName"]).lean(true)


            // filter them by 
            const SpecificNotificationsPost = User.Notifications.filter((e) => {
                return e.NotificationOration == "follow" && e.NotificationToId == body.FindUserId
            })

            // if SpecificNotificationsPost empty  ?
            if (SpecificNotificationsPost.length <= 0) {
                await Account.findByIdAndUpdate(body.FindUserId, {
                    $addToSet: {
                        Notifications: {
                            NotificationName: `${body.UserName} ${body.FamilyName}`,
                            NotificationBody: `Started Following You`,
                            NotificationFromId: body.OwnerId,
                            NotificationToId: body.FindUserId,
                            NotificationFrom: "people",
                            NotificationOration: "follow",
                            NotificationOwnerImage: body.OwnerImage,
                            NotificationUsersIds: body.OwnerId
                        }
                    }
                })
            }



            // if SpecificNotificationsPost isn't empty ?
            else if (SpecificNotificationsPost.length > 0) {

                // clean the notification object
                SpecificNotificationsPost[0].NotificationOwnerImage = SpecificNotificationsPost[0].NotificationOwnerImage.slice(0, 3)
                SpecificNotificationsPost[0].NotificationName = SpecificNotificationsPost[0].NotificationName.slice(0, 8)

                // if the user don't add comments before in this post
                if (!SpecificNotificationsPost[0].NotificationUsersIds.includes(body.OwnerId)) {
                    SpecificNotificationsPost[0].NotificationOwnerImage.unshift(body.OwnerImage)
                    SpecificNotificationsPost[0].NotificationUsersIds.push(body.OwnerId)
                    SpecificNotificationsPost[0].NotificationName.unshift(body.UserName)
                }


                await Account.updateOne({ _id: body.FindUserId }, {
                    $set: {
                        "Notifications.$[el].NotificationName": SpecificNotificationsPost[0].NotificationName,
                        "Notifications.$[el].NotificationOwnerImage": SpecificNotificationsPost[0].NotificationOwnerImage !== "" ? SpecificNotificationsPost[0].NotificationOwnerImage : "",
                        "Notifications.$[el].NotificationBody": `Added you to their circles`,
                        "Notifications.$[el].NotificationFromId": body.OwnerId,
                        "Notifications.$[el].NotificationToId": body.FindUserId,
                        "Notifications.$[el].NotificationOration": "follow",
                        "Notifications.$[el].NotificationFrom": 'people',
                        "Notifications.$[el].NotificationUsersIds": SpecificNotificationsPost[0].NotificationUsersIds
                    }
                },
                    { arrayFilters: [{ "el.NotificationToId": body.FindUserId, "el.NotificationOration": "follow" }] }
                )
            }




            res.status(200).json(1)
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};