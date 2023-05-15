const CollectionsSchema = require('../Schema/Collection')

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
