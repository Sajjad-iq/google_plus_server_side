const Account = require('../Schema/Account')
const Post = require('../Schema/Post')


exports.EditUserAccount = async (req, res) => {

    const body = req.body

    if (req.session.UserId) {

        try {

            // edit my account
            const user = await Account.findByIdAndUpdate(body.User._id, {
                $set: body.User
            }).select(["UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin"]).lean();


            if (body.User.UserName !== user.UserName || body.User.FamilyName !== user.FamilyName || body.User.ProfilePicture !== user.ProfilePicture) {
                //change my posts owner name and image
                await Post.updateMany({ PostOwnerId: body.User._id },
                    {
                        PostOwnerName: `${body.User.UserName} ${body.User.FamilyName}`,
                        PostOwnerImage: body.User.ProfilePicture
                    }
                );

                //change my comments owner name and image
                await Post.updateMany({ "Comments.CommentOwnerId": body.User._id }, {
                    $set: {
                        "Comments.$[el].CommentOwnerName": `${body.User.UserName} ${body.User.FamilyName}`,
                        "Comments.$[el].CommentOwnerImage": body.User.ProfilePicture
                    }
                },
                    { arrayFilters: [{ "el.CommentOwnerId": body.User._id }] }

                );
                res.status(200).json("done");

            } else {
                res.status(200).json("done");
            }

        } catch (e) {
            console.log(e)
            return res.status(500).json("server error");

        }

    } else {
        return res.status(410).json("You can update only your account!");
    }

}



exports.FirstLoad = async (req, res) => {


    try {
        const user = await Account.findById(req.session.UserId).select(["UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following"]).lean();
        if (user) res.status(200).json(user)
        else res.status(404).json("please sign in")

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error");
    }

}
