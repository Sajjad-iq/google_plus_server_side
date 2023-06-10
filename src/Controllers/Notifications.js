const AccountSchema = require('../Schema/Account')
const mongoose = require("mongoose")
const NotificationsSchema = require("../Schema/Notifications")

exports.FetchNotifications = async (req, res) => {

    try {

        if (req.session.UserId) {

            const UserNotifications = await NotificationsSchema.find({ NotificationByAccount: req.session.UserId })
            res.status(200).json(UserNotifications)
        } else return res.status(404).json("your don't sign in")

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}


