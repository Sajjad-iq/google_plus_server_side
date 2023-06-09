const mongoose = require("mongoose");


const Comments = new mongoose.Schema({
    CommentBody: String,
    CommentOwnerName: String,
    CommentOwnerId: String,
    CommentOwnerImage: {
        default: "",
        type: String
    },
    CommentImage: {
        default: "",
        type: String
    },
    CommentsLikes: {
        default: [],
        type: Array
    },
    CommentsRePlayTo: {
        default: "",
        type: String
    }
    ,
    CommentFromPost: {
        default: "",
        type: String
    }
},
    { timestamps: true }

)

module.exports = mongoose.model("Comments", Comments)
