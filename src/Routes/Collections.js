const express = require("express")
const router = express.Router()
const CollectionsController = require("../Controllers/Collections")

router.post("/AddCollections", CollectionsController.AddCollections)
router.post("/DeleteCollection", CollectionsController.DeleteCollection)
router.post("/EditCollection", CollectionsController.EditCollection)
router.post("/AddFollowToCollection", CollectionsController.AddFollowToCollection)
router.post("/", CollectionsController.FetchCollections)
module.exports = router  
