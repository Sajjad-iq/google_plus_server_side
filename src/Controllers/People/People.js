const Account = require('../../Schema/Account')
const NotificationsSchema = require("../../Schema/Notifications")


exports.FindUserHandler = async (req, res) => {

    try {
        const user = await Account.findById(req.body.id).select(["UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin", "FollowingCollections"]).lean();

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

        const Users = await Account.find().limit(PayloadCount + 10).sort({ createdAt: -1 }).select(
            ["_id", "UserName", "FamilyName", "ProfilePicture", "Description", "Followers"]
        ).lean()

        if (Users && req.session.UserId) {
            res.status(200).json({
                ResponseUsers: Users.splice(PayloadCount, PayloadCount + 10),
                StopFetching: Users.length < PayloadCount ? true : false
            })
        }
        else { res.status(404).json("Posts not found") }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};


exports.BlockUserHandler = async (req, res) => {
    try {
        if (req.session.UserId) {
            await Account.updateOne({ _id: req.session.UserId },
                req.body.operation === "add" ?
                    { $set: { BlockedAccounts: req.body.BlockedUserId } }
                    :
                    { $pull: { BlockedAccounts: req.body.BlockedUserId } }
            )
            res.status(200).json("done!")

        } else { res.status(404).json("invalid access") }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};



