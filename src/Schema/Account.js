const { string } = require("joi");
const mongoose = require("mongoose");

const FollowingSchema = new mongoose.Schema({

    FollowingName: {
        type: String,
        default: ""
    },
    FollowingId: {
        type: String,
        default: ""
    },
    FollowingImage: {
        default: "",
        type: String
    },
},
    { timestamps: true }

)

const NotificationsSchema = new mongoose.Schema({

    NotificationName: {
        type: Array,
        default: []
    },
    NotificationBody: {
        type: String,
        default: ""
    },
    NotificationFromId: {
        type: String,
        default: ""
    },
    NotificationToId: {
        type: String,
        default: ""
    },
    NotificationOration: {
        type: String,
        default: ""
    },
    NotificationFrom: {
        type: String,
        default: ""
    },
    NotificationOwnerImage: {
        default: [],
        type: Array
    },
    NotificationUsersIds: {
        default: [],
        type: Array
    },
},
    { timestamps: true }

)

const AccountSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: true,
        min: 3,
        max: 10
    },
    FamilyName: {
        type: String,
        required: true
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
        type: [FollowingSchema],
        default: []
    },
    IsAdmin: {
        type: Boolean,
        default: false
    },
    Notifications: {
        type: [NotificationsSchema],
        default: []
    },
    FollowingCollections: {
        type: Array,
        default: []
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("Account", AccountSchema)