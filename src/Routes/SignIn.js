const express = require("express")
let router = express.Router()
let SignInController = require("../Controllers/SignIn")

router.post("/", SignInController.SignInHandler)

module.exports = router