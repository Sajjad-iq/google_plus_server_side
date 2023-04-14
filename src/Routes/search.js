const express = require("express")
const router = express.Router()
const SearchController = require("../Controllers/Search")

router.post("/", SearchController.SearchFindUserHandler)

module.exports = router
