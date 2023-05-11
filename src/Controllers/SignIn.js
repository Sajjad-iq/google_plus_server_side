const Account = require('../Schema/Account')
const bcrypt = require("bcrypt")

exports.SignInHandler = async (req, res) => {


    try {

        const user = await Account.findOne({ Email: req.body.Email }).select(["_id", "UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin"]).lean();
        const PasswordCompare = await bcrypt.compare(req.body.Password, user.Password)

        if (user) {
            if (PasswordCompare) {
                req.session.UserId = user._id

                res.header('Access-Control-Allow-Credentials', true);
                res.header('Access-Control-Allow-Origin', "http://localhost:5173");
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
                res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
                next();
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

