const express = require("express")
const router = express.Router()
const PeopleController = require("../Controllers/People")

router.post("/", PeopleController.FindUserHandler)
router.post("/Get", PeopleController.FetchAllUsersHandler)
router.post("/AddFollow", PeopleController.AddFollowersHandler)

module.exports = router