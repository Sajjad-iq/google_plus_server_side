const express = require("express")
let router = express.Router()
let SignUpControllers = require("../Controllers/SignUp")

router.post("/", SignUpControllers.AddNewAccount)

module.exports = router