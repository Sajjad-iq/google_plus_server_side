const { boolean } = require("joi");
const mongoose = require("mongoose");


const Notifications = new mongoose.Schema({

    NotificationName: {
        type: Array,
        default: []
    },
    NotificationBody: {
        type: String,
        default: ""
    },
    NotificationOnClickTargetId: {
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
    NotificationUsersIncludedImages: {
        default: [],
        type: Array
    },
    NotificationUsersIncludedIds: {
        default: [],
        type: Array
    },
    NotificationByAccount: {
        type: String,
        default: ""
    },
    Read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
    },
    createdAt: { type: Date, expires: 1000 * 60 * 60 * 24, default: Date.now },


}

)

module.exports = mongoose.model("Notifications", Notifications)
