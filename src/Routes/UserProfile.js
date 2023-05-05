const express = require("express")
let router = express.Router()
let ProfileController = require("../Controllers/UserProfile")

router.put("/edit", ProfileController.EditUserAccount)

module.exports = router