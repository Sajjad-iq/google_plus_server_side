const express = require("express")
const router = express.Router()
const SearchController = require("../Controllers/Search")

router.post("/", SearchController.SearchPageSuggestions)
router.post("/Searching", SearchController.StartSearching)
module.exports = router  
