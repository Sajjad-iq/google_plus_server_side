const CollectionsSchema = require('../Schema/Collection')
const Account = require('../Schema/Account')
const Posts = require('../Schema/Post')

exports.SearchPageSuggestions = async (req, res) => {

    try {

        let Data = {
            Accounts: [],
            Posts: [],
            Collections: [],
            Communities: [],
        }

        await Promise.all([
            Data.Accounts = await Account.find().limit(2).sort({ createdAt: -1 }).select(
                ["_id", "UserName", "FamilyName", "ProfilePicture", "Description", "Followers"]
            ).lean()
            ,
            Data.Posts = await Posts.find().limit(2).sort({ createdAt: -1 }).lean(),
            Data.Collections = await CollectionsSchema.find().limit(2).sort({ createdAt: -1 }).lean()
        ])

        if (req.session.UserId) res.status(200).json(Data)
        else res.status(404).json("invalid access")
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};


exports.StartSearching = async (req, res) => {

    try {

        let Data = {
            Accounts: [],
            Posts: [],
            Collections: [],
            Communities: [],
        }

        const User = await Account.find({ $text: { $search: req.body.SearchWord } }).limit(5).select(["_id"]).lean()

        await Promise.all([
            Data.Accounts = await Account.find({ '_id': { $in: User.map((e) => { return e._id }) } }).limit(2).sort({ createdAt: -1 }).select(
                ["_id", "UserName", "FamilyName", "ProfilePicture", "Description", "Followers"]
            ).lean()
            ,
            Data.Posts = await Posts.find({ 'PostOwnerId': { $in: User.map((e) => { return e._id }) } }).limit(2).sort({ createdAt: -1 }).lean(),
            Data.Collections = await CollectionsSchema.find({ 'CollectionOwnerId': { $in: User.map((e) => { return e._id }) } }).limit(2).sort({ createdAt: -1 }).lean()
        ])

        if (req.session.UserId) res.status(200).json(Data)
        else res.status(404).json("invalid access")
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};
