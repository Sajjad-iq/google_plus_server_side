const express = require("express")
const router = express.Router()
const CollectionsController = require("../Controllers/Collections")

router.post("/AddCollections", CollectionsController.AddCollections)
router.post("/", CollectionsController.FetchCollections)

module.exports = router  