const Account = require('../../Schema/Account')


exports.FindUserHandler = async (req, res) => {
    try {
        const user = await Account.findById(req.body.id).select(["UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin"]).lean();
        if (user) res.status(200).json(user)
        else res.status(404).json("user not found")
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};


exports.FetchAllUsersHandler = async (req, res) => {
    try {
        const PayloadCount = req.body.PayloadCount
        const Users = await Account.find().limit(PayloadCount + 10).sort({ createdAt: -1 }).select(
            ["_id", "UserName", "FamilyName", "ProfilePicture"]
        ).lean()
        if (Users) {
            res.status(200).json({
                ResponseUsers: Users.splice(PayloadCount, PayloadCount + 10),
                StopFetching: Users.length < PayloadCount ? true : false
            })
        }
        else { res.status(404).json("Posts not found") }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};





