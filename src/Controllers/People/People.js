const Account = require('../../Schema/Account')
const NotificationsSchema = require("../../Schema/Notifications")


exports.FindUserHandler = async (req, res) => {

    try {
        const user = await Account.findById(req.body.id).lean();

        if (req.body.setNotificationAsRead) {
            await NotificationsSchema.updateOne({
                NotificationByAccount: req.body.NotificationsData.NotificationByAccount,
                NotificationOnClickTargetId: req.body.NotificationsData.NotificationOnClickTargetId
            }, { $set: { Read: true } }
            )
        }
        if (user && req.session.UserId) res.status(200).json(user)
        else res.status(404).json("user not found")
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};


exports.FetchAllUsersHandler = async (req, res) => {
    try {
        const PayloadCount = req.body.PayloadCount

        let Users = []
        /*  */

        if (req.body.SelectedButton === 0) {
            Users = await Account.find().limit(PayloadCount + 10).sort({ createdAt: -1 }).select(
                ["_id", "UserName", "FamilyName", "ProfilePicture", "Description", "Followers"]
            ).lean()
        }
        else if (req.body.SelectedButton === 1) {
            Users = await Account.find({ '_id': { $in: req.body.UserFollowing } }).limit(req.body.FindMoreFollowing ? PayloadCount + 10 : 6).sort({ createdAt: -1 }).select(
                ["_id", "UserName", "FamilyName", "ProfilePicture", "Description", "Followers"]
            ).lean()
        }

        else if (req.body.SelectedButton === 2) {
            Users = await Account.find({ '_id': { $in: req.body.UserFollowers } }).limit(6).sort({ createdAt: -1 }).select(
                ["_id", "UserName", "FamilyName", "ProfilePicture", "Description", "Followers"]
            ).lean()
        }



        if (req.session.UserId) {
            res.status(200).json({
                ResponseUsers: Users.splice(PayloadCount, PayloadCount + 10),
                StopFetching: Users.length < PayloadCount ? true : false
            })
        }
        else { res.status(404).json("invalid access") }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};


exports.BlockUserHandler = async (req, res) => {
    try {
        if (req.session.UserId) {

            await Promise.all([
                await Account.updateOne({ _id: req.session.UserId },
                    req.body.operation === "add" ?
                        { $addToSet: { BlockedAccounts: req.body.BlockedUserId } }
                        :
                        { $pull: { BlockedAccounts: req.body.BlockedUserId } }
                ),
                await Account.updateOne({ _id: req.body.BlockedUserId },
                    req.body.operation === "add" ?
                        { $addToSet: { BlockedFromAccounts: req.session.UserId } }
                        :
                        { $pull: { BlockedFromAccounts: req.session.UserId } }
                )
            ])

            res.status(200).json("done!")

        } else { res.status(404).json("invalid access") }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};



