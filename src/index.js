
const express = require("express")
const mongoose = require("mongoose")
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors');
const dotenv = require("dotenv")
const app = express()
const hpp = require('hpp');
const bodyParser = require("body-parser")
const compression = require('compression')
const http = require("http")
const server = http.createServer(app);
const { Server } = require("socket.io");


// app extensions 
app.use(cors({
    origin: '*'
}));
dotenv.config()
app.use(helmet())
app.use(morgan("common"))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(compression({
    level: 6,
    threshold: 100 * 1000
}))
app.use(hpp())


// socket io server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// app routes
const PostsRoutes = require('./Routes/Posts')
const SignUpRoutes = require('./Routes/SignUp')
const SignInRoutes = require('./Routes/SignIn')
const ProfileRoutes = require('./Routes/UserProfile')
const SearchRoutes = require('./Routes/search')
const PeopleRoutes = require('./Routes/People')
const NotificationsRoutes = require('./Routes/Notifications');
app.use("/api/SignUp", SignUpRoutes)
app.use("/api/SignIn", SignInRoutes)
app.use("/api/Profile", ProfileRoutes)
app.use("/api/Posts", PostsRoutes)
app.use("/api/Search", SearchRoutes)
app.use("/api/People", PeopleRoutes)
app.use("/api/Notifications", NotificationsRoutes)



// database config
mongoose.set('strictQuery', false)
mongoose.connect(process.env.DataBase_URL, (err) => {
    if (err) console.log(err)
    else console.log("done")
})



// socket io config

let users = require('./Listeners/OnlineUsers')
let notifications = require('./Listeners/Notifications')
let onlineUsers = [];


const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};


const Connect = (socket) => {
    users.NewUser(socket, onlineUsers, io)
    notifications.NewNotifications(socket, onlineUsers, io)

    socket.on("disconnect", () => {
        removeUser(socket.id);
    });
}


io.on("connection", Connect);

server.listen(process.env.PORT, () => console.log("server is running"))

