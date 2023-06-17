const mongoose = require("mongoose");

const Collection = new mongoose.Schema({
    CollectionTitle: {
        type: String,
        required: true,
        min: 3,
        max: 10
    },
    Tagline: {
        type: String,
        min: 5,
        max: 80
    },
    CollectionsCoverPicture: {
        type: String,
        default: ""
    },
    CollectionFollowing: {
        type: Array,
        default: []
    },
    CollectionOwnerName: {
        type: String,
        default: ""
    },
    CollectionOwnerId: {
        type: String,
        default: ""
    },
    CollectionOwnerImage: {
        type: String,
        default: ""
    },
    Color: {
        type: String,
        default: ""
    }

},
    { timestamps: true }
)

module.exports = mongoose.model("Collections", Collection)