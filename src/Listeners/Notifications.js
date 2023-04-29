
const getUser = (UserId, arr) => {
    return arr.find((id) => id.UserId === UserId);
};

exports.NewNotifications = async (socket, onlineUsers, io) => {

    socket.on("send_new_notification", async (TargetUser) => {
        try {
            let user = await getUser(TargetUser, onlineUsers)
            if (user) io.to(user.socketId).emit("new_notification")
        } catch (e) {
            console.log(e)
        }

    })


}