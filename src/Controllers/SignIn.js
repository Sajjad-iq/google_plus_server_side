const Account = require('../Schema/Account')

exports.SignInHandler = async (req, res) => {

    try {
        const user = await Account.findOne({ Email: req.body.Email });

        if (user) {
            if (user.Password == req.body.Password) {
                res.status(200).json({
                    User: user
                })
            } else res.status(404).json("Email or Password Wrong")
        } else res.status(404).json("Account not found")


    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};


exports.SignInReFreshHandler = async (req, res) => {

    try {
        const user = await Account.findOne({ Email: req.body.Email });
        if (user) {
            if (user.Password == req.body.Password) {
                res.status(200).json(user)
            } else { res.status(404).json(null) }
        } else { res.status(404).json("account not found") }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};