const express = require("express")
const router = express.Router()
const NotificationsController = require("../Controllers/Notifications")

router.post("/", NotificationsController.FetchNotifications)


module.exports = router  