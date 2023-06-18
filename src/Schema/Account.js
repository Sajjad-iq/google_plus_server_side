const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: true,
        min: 3,
        max: 10,
        unique: true,
        index: true
    },
    FamilyName: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    Email: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true,
        min: 6,
    },
    ProfilePicture: {
        type: String,
        default: ""
    },
    CoverPicture: {
        type: String,
        default: ""
    },
    Description: {
        type: String,
        default: ""
    },
    Followers: {
        type: Array,
        default: []
    },
    Following: {
        type: Array,
        default: []
    },
    FollowingCollections: {
        type: Array,
        default: []
    },
    BlockedAccounts: {
        type: Array,
        default: []
    }
},
    { timestamps: true }
)

AccountSchema.index({ 'UserName': "text", 'FamilyName': "text" })

module.exports = mongoose.model("accounts", AccountSchema)