const express = require("express")
let router = express.Router()
let SignInController = require("../Controllers/SignIn")

router.post("/", SignInController.SignInHandler)
router.post("/Refresh", SignInController.SignInReFreshHandler)

module.exports = router