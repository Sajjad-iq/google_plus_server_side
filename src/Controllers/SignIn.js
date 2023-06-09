const Account = require('../Schema/Account')
const bcrypt = require("bcrypt")

exports.SignInHandler = async (req, res) => {


    try {

        const user = await Account.findOne({ Email: req.body.Email }).select(["_id", "UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin"]).lean();

        if (user) {
            const PasswordCompare = await bcrypt.compare(req.body.Password, user.Password)

            if (PasswordCompare) {
                req.session.UserId = user._id
                res.header("Content-Type", "application/json")
                res.status(200).json({
                    User: user
                })
            } else res.status(404).json("Password Wrong")
        } else res.status(404).json("Account not found")


    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};

