const CollectionsSchema = require('../Schema/Collection')
const Account = require('../Schema/Account')

async function AddNewCollection(body) {
    const Collection = new CollectionsSchema({
        CollectionTitle: body.CollectionTitle,
        Tagline: body.Tagline,
        CollectionsCoverPicture: body.CollectionsCoverPicture,
        CollectionFollowing: body.CollectionFollowing,
        CollectionOwnerId: body.CollectionOwnerId,
        Color: body.Color,
        CollectionOwnerName: body.CollectionOwnerName,
        CollectionOwnerImage: body.CollectionOwnerImage
    })
    await Collection.save()
}

exports.AddCollections = async (req, res) => {
    if (req.session.UserId && req.body) {

        try {
            await AddNewCollection(req.body)
            res.status(200).json("done")
        } catch (e) {
            console.log(e)
            return res.status(500).json("server error")
        }

    } else return res.status(404).json("your don't sign in")

}


exports.FetchCollections = async (req, res) => {
    if (req.session.UserId && req.body) {

        try {
            const Collections = await CollectionsSchema.find(req.body.CollectionsOwner).limit(req.body.PayloadCount).lean()
            res.status(200).json(Collections)
        } catch (e) {
            console.log(e)
            return res.status(500).json("server error")
        }

    } else return res.status(404).json("your don't sign in")

}


exports.AddFollowToCollection = async (req, res) => {


    try {
        const body = req.body

        console.log(body)
        // if it's  UnFollow operation
        if (body.operation === "delete") {

            // remove Collection id in the target user object 
            await Account.findByIdAndUpdate(body.UserId, {
                $pull: { FollowingCollections: body.CollectionId }
            }).select(["_id", "UserName", "FamilyName", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin", "FollowingCollections"]).lean()

            // remove in target Collection
            await CollectionsSchema.findByIdAndUpdate(body.CollectionId, {
                $pull: {
                    CollectionFollowing: body.UserId
                }
            }).lean()
            res.status(200).json(-1)
        }





        // if it's add follow operation
        else if (body.operation === "add") {

            // add Collection id in the target user object 

            await Account.findByIdAndUpdate(body.UserId, {
                $addToSet: { FollowingCollections: body.CollectionId }
            }).select(["_id", "UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin", "FollowingCollections"]).lean()

            // add in target Collection
            await CollectionsSchema.findByIdAndUpdate(body.CollectionId, {
                $addToSet: {
                    CollectionFollowing: body.UserId
                }
            }).lean()
            res.status(200).json(1)
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }


}
