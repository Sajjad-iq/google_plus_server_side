const Account = require('../Schema/Account')
const bcrypt = require("bcrypt")

exports.SignInHandler = async (req, res) => {


    try {
        let email = await req.body.Email.split(" ").join("")
        let password = await req.body.Password.split(" ").join("")

        const user = await Account.findOne({ Email: email }).lean();

        if (user) {
            const PasswordCompare = await bcrypt.compare(password, user.Password)

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

