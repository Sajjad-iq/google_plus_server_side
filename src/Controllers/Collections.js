const CollectionsSchema = require('../Schema/Collection')
const Account = require('../Schema/Account')
const Posts = require('../Schema/Post')
const sharp = require('sharp');

async function AddNewCollection(body, CollectionsImage) {
    const Collection = new CollectionsSchema({
        CollectionTitle: body.CollectionTitle,
        Tagline: body.Tagline,
        CollectionsCoverPicture: CollectionsImage,
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

            if (req.body.CollectionsCoverPicture !== "") {
                // convert from base64 
                let base64Image = req.body.CollectionsCoverPicture.split(';base64,').pop();
                let imgBuffer = Buffer.from(base64Image, 'base64');

                // resize 
                sharp(imgBuffer)
                    .resize(1280, 720)
                    .webp({ quality: 75, compressionLevel: 7 })
                    .toBuffer()
                    // add new post
                    .then(data => {
                        let newImagebase64 = `data:image/webp;base64,${data.toString('base64')}`
                        AddNewCollection(req.body, newImagebase64)
                    })
                    .catch(err => console.log(`downisze issue ${err}`))

                res.status(200).json("done")
            } else {
                AddNewCollection(req.body, "")
                res.status(200).json("done")
            }
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


exports.EditCollection = async (req, res) => {
    const body = req.body

    try {

        if (body !== undefined && req.session.UserId == body.CollectionOwnerId) {

            if (body.CollectionsCoverPicture !== "") {
                // convert from base64 
                let base64Image = body.CollectionsCoverPicture.split(';base64,').pop();
                let imgBuffer = Buffer.from(base64Image, 'base64');

                // resize 
                sharp(imgBuffer)
                    .resize(1280, 720)
                    .webp({ quality: 75, compressionLevel: 7 })
                    .toBuffer()
                    .then(async (data) => {

                        let newImagebase64 = `data:image/webp;base64,${data.toString('base64')}`

                        await CollectionsSchema.findByIdAndUpdate(body.CollectionId, {
                            CollectionTitle: body.CollectionTitle,
                            Tagline: body.Tagline,
                            CollectionsCoverPicture: newImagebase64,
                            Color: body.Color,
                            CollectionOwnerName: body.CollectionOwnerName,
                            CollectionOwnerImage: body.CollectionOwnerImage
                        }).lean()

                        await Posts.findOneAndUpdate({ CollectionId: req.body.CollectionId }, {
                            CollectionName: body.CollectionTitle,
                        }).select(["_id", "CollectionName"]).lean(true)

                        res.status(200).json("done")
                    })
                    .catch(err => {
                        console.log(`downisze issue ${err}`)
                        res.status(500).json("")
                    })

            }


            else {
                await CollectionsSchema.findByIdAndUpdate(body.CollectionId, {
                    CollectionTitle: body.CollectionTitle,
                    Tagline: body.Tagline,
                    CollectionsCoverPicture: body.CollectionsCoverPicture,
                    Color: body.Color,
                    CollectionOwnerName: body.CollectionOwnerName,
                    CollectionOwnerImage: body.CollectionOwnerImage
                }).lean()

                await Posts.findOneAndUpdate({ CollectionId: req.body.CollectionId }, {
                    CollectionName: body.CollectionTitle,
                }).select(["_id", "CollectionName"]).lean(true)

                res.status(200).json("done")
            }

        } else {
            return res.status(405).json("modify error")
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}

exports.DeleteCollection = async (req, res) => {
    try {
        if (req.body.CollectionOwnerId == req.session.UserId) {
            await CollectionsSchema.findByIdAndDelete(req.body.CollectionId).then(function () {
            }).catch(function (error) {
                res.status(400).json(error.message)
            });

            await Posts.findOneAndDelete({ CollectionId: req.body.CollectionId }).then(function () {
                res.status(200).json("delete")
            }).catch(function (error) {
                res.status(400).json(error.message)
            });
        } else return res.status(404).json("your don't sign in")

    } catch (e) {
        console.log(e)
        return res.status(500).json("server error")
    }
}
