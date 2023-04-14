const express = require("express")
let router = express.Router()
let ProfileController = require("../Controllers/UserProfile")

router.put("/:id", ProfileController.EditUserAccount)

module.exports = router