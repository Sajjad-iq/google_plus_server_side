const AccountSchema = require('../Schema/Account')

exports.FetchNotifications = async (req, res) => {
    const newArr = []
    try {
        const UserNotifications = await AccountSchema.findById(req.params.id).select(
            ["Notifications"]
        ).lean()

        let NotificationsArr = UserNotifications.Notifications
        for (let i = NotificationsArr.length - 1; i > NotificationsArr.length - 14; i--) {
            if (NotificationsArr[i]) newArr.push(NotificationsArr[i])
        }

        res.status(200).json(newArr)
    } catch (e) {
        return res.status(500).json("server error")
    }
}

