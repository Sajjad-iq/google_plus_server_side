const express = require("express")
const router = express.Router()
const PeopleController = require("../Controllers/People/People")
const AddFollowController = require("../Controllers/People/AddFollowers")

router.post("/", PeopleController.FindUserHandler)
router.post("/Get", PeopleController.FetchAllUsersHandler)
router.post("/AddFollow", AddFollowController.AddFollowersHandler)

module.exports = router