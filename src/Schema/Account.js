const mongoose = require("mongoose");

const NotificationsSchema = new mongoose.Schema({

    NotificationName: {
        type: String,
        default: ""
    },
    NotificationBody: {
        type: String,
        default: ""
    },
    NotificationFromId: {
        type: String,
        default: ""
    },
    NotificationFrom: {
        type: String,
        default: ""
    },
    NotificationOwnerImage: {
        default: "",
        type: String
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
    IsAdmin: {
        type: Boolean,
        default: false
    },
    Notifications: {
        type: [NotificationsSchema],
        default: []
    },
},
    { timestamps: true }
)

module.exports = mongoose.model("Account", AccountSchema)