const express = require("express")
const router = express.Router()
const NotificationsController = require("../Controllers/Notifications")

router.get("/:id", NotificationsController.FetchNotifications)


module.exports = router  