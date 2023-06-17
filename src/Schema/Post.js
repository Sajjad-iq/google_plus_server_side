const mongoose = require("mongoose");


const AddPostSchema = new mongoose.Schema({
    PostBody: {
        type: String,
        default: ""
    },
    PostOwnerName: {
        type: String,
        default: ""
    },
    PostOwnerImage: {
        type: String,
        default: ""
    },
    PostOwnerId: {
        type: String,
        default: ""
    },
    PostImage: {
        type: String,
        default: ""
    },
    Link: {
        type: String,
        default: ""
    },
    Likes: {
        type: Array,
        default: []
    },
    CommentsCounter: {
        type: Number,
        default: 0
    },

    PostFrom: {
        type: String,
        default: ""
    },
    CollectionName: {
        type: String,
        default: ""
    },
    CollectionId: {
        type: String,
        default: ""
    },
    CollectionOwnerId: {
        type: String,
        default: ""
    },
    PrivateShareUsersIds: {
        type: Array,
        default: []
    }
},
    { timestamps: true }

)

module.exports = mongoose.model("Posts", AddPostSchema)
