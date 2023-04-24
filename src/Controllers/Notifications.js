const AccountSchema = require('../Schema/Account')
const mongoose = require("mongoose")

exports.FetchNotifications = async (req, res) => {
    try {
        const UserNotifications = await AccountSchema.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
            { $unwind: "$Notifications" },
            { $sort: { "Notifications.updatedAt": -1 } },
            { $limit: 15 },
            { $group: { _id: "$_id", Notifications: { $push: "$Notifications" } } }
        ]);

        if (UserNotifications.length >= 1) res.status(200).json(UserNotifications[0].Notifications)
        else res.status(200).json([])
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}


