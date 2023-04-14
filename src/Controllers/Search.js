const Account = require('../Schema/Account')

exports.SearchFindUserHandler = async (req, res) => {

    let usersArr = []
    try {
        const users = await Account.find();
        if (users) {
            users.map((e) => {
                if (e.UserName == req.body.search_word) {
                    usersArr.push(e)
                }
            })
            res.status(200).json(usersArr)
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
};

