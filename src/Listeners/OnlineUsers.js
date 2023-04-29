const AccountSchema = require('../Schema/Account')

const addNewUser = (UserId, socketId, arr) => {
    !arr.some((id) => id.UserId === UserId) &&
        arr.push({ UserId, socketId });
};


exports.NewUser = async (socket, onlineUsers, io) => {


    socket.on("newUser", async (UserId) => {

        let isValid = false
        let User
        addNewUser(UserId, socket.id, onlineUsers);

        console.log(`${onlineUsers.length} Users Connected`)
        try {
            let user = await AccountSchema.findById(UserId).select(["_id", "UserName", "FamilyName", "Email", "Password", "ProfilePicture", "CoverPicture", "Description", "Followers", "Following", " IsAdmin"]).lean()
            if (user) {
                isValid = true
                User = user
            }
            else isValid = false
        } catch (e) {
            isValid = false
            console.log(e)
        }

        io.to(socket.id).emit("validate_user", { Check: isValid, user: User })
    })


}