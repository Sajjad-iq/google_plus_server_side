const Account = require('../../Schema/Account')
const NotificationsSchema = require("../../Schema/Notifications")

exports.AddFollowersHandler = async (req, res) => {

    try {
        const body = req.body

        // if it's  UnFollow operation
        if (body.operation === "remove") {

            await Promise.all([
                Account.updateOne({ _id: body.FindUserId }, { $pull: { Followers: body.OwnerId } }).select(["_id"]).lean()
                ,
                Account.updateOne({ _id: body.OwnerId }, { $pull: { Following: body.FindUserId } }).select(["_id"]).lean()
            ])
            res.status(200).json(-1)
        }


        // if it's add follow operation
        else {

            await Promise.all([
                Account.updateOne({ _id: body.FindUserId }, { $addToSet: { Followers: body.OwnerId } }).select(["_id"]).lean()
                ,
                Account.updateOne({ _id: req.body.OwnerId }, { $addToSet: { Following: req.body.FindUserId } }).select(["_Id"]).lean()
            ])



            //// Add notifications part

            const NotificationsArr = await NotificationsSchema.find({ NotificationByAccount: body.FindUserId, NotificationOration: "follow" })

            // if SpecificNotificationsPost empty  ?

            if (NotificationsArr.length <= 0) {
                const NewNotification = new NotificationsSchema({
                    NotificationName: [`${body.UserName} ${body.FamilyName}`],
                    NotificationBody: `Started Following You`,
                    NotificationOnClickTargetId: body.OwnerId,
                    NotificationFrom: "people",
                    NotificationOration: "follow",
                    NotificationUsersIncludedImages: [body.OwnerImage],
                    NotificationUsersIncludedIds: [body.OwnerId],
                    NotificationByAccount: body.FindUserId
                    , Read: false
                })
                await NewNotification.save()
            }

            // if SpecificNotificationsPost isn't empty ?
            else if (NotificationsArr.length > 0) {

                const TargetNotification = NotificationsArr[0]
                // clean the notification object
                TargetNotification.NotificationUsersIncludedImages = TargetNotification.NotificationUsersIncludedImages.slice(0, 4)
                TargetNotification.NotificationName = TargetNotification.NotificationName.slice(0, 8)

                // if the user don't add comments before in this post
                if (!TargetNotification.NotificationUsersIncludedIds.includes(body.OwnerId)) {
                    TargetNotification.NotificationUsersIncludedImages.unshift(body.OwnerImage)
                    TargetNotification.NotificationUsersIncludedIds.push(body.OwnerId)
                    TargetNotification.NotificationName.unshift(body.UserName)
                }


                await NotificationsSchema.updateOne({ NotificationByAccount: body.FindUserId, NotificationOration: "follow" }, {
                    $set: {
                        NotificationName: TargetNotification.NotificationName,
                        NotificationUsersIncludedImages: TargetNotification.NotificationUsersIncludedImages,
                        NotificationBody: `Added you to their circles`,
                        NotificationOnClickTargetId: body.OwnerId,
                        NotificationByUserAccount: body.FindUserId,
                        NotificationOration: "follow",
                        NotificationFrom: 'people',
                        NotificationUsersIncludedIds: TargetNotification.NotificationUsersIncludedIds,
                        Read: false
                    }
                }
                )
            }

            res.status(200).json(1)
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};