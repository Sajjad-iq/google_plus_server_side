const Account = require('../Schema/Account')
const Joi = require("joi")
const bcrypt = require("bcrypt")


exports.AddNewAccount = async (req, res) => {

    const body = req.body
    const signUpSchema = Joi.object({
        UserName: Joi.string().min(1).max(10).required(),
        FamilyName: Joi.string().min(1).max(10).required(),
        Email: Joi.string().email().required(),
        Password: Joi.string().min(4).max(25).required()
    })


    try {
        const allAccounts = await Account.findOne({ Email: req.body.Email }).select(["UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin"]).lean();
        const { error, value } = signUpSchema.validate(body)

        if (!allAccounts) {
            if (error) {
                return res.status(404).json(error.message)
            } else {



                const account = new Account({
                    UserName: body.UserName,
                    FamilyName: body.FamilyName,
                    Email: body.Email,
                    Password: await bcrypt.hash(body.Password, 10)
                })

                await account.save()
                res.status(200).json("account is declared")
            }
        } else res.status(404).json("this email is exist")

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}
