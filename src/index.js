
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
const MongoSanitize = require("express-mongo-sanitize")
const rateLimiter = require("express-rate-limit");
const session = require("express-session")
const MongoStore = require('connect-mongo');
const cookieParser = require("cookie-parser")



// limit the requests
const limiter = rateLimiter({
    max: 50,
    windowMS: 30000,
    message: "You can't make any more requests at the moment. Try again later",
});


// app extensions
dotenv.config()
app.enable('trust proxy');

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: "GET, POST, PUT, DELETE"
}));

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
app.use(
    MongoSanitize({
        replaceWith: '_',
    }),
);
app.use(limiter)
app.use(cookieParser())
// database config
mongoose.set('strictQuery', false)
mongoose.connect(process.env.DataBase_URL, (err) => {
    if (err) console.log(err)
    else console.log("done")
})


// sessions config
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    },
    store: MongoStore.create({
        mongoUrl: process.env.DataBase_URL,
        autoRemove: 'interval',
        autoRemoveInterval: 240 // In minutes. Default
    })
}))




// app routes
const PostsRoutes = require('./Routes/Posts')
const SignUpRoutes = require('./Routes/SignUp')
const SignInRoutes = require('./Routes/SignIn')
const ProfileRoutes = require('./Routes/UserProfile')
const PeopleRoutes = require('./Routes/People')
const NotificationsRoutes = require('./Routes/Notifications');
const CollectionsRoutes = require('./Routes/Collections');
app.use("/api/SignUp", SignUpRoutes)
app.use("/api/SignIn", SignInRoutes)
app.use("/api/Profile", ProfileRoutes)
app.use("/api/Posts", PostsRoutes)
app.use("/api/People", PeopleRoutes)
app.use("/api/Notifications", NotificationsRoutes)
app.use("/api/Collections", CollectionsRoutes)


server.listen(process.env.PORT, () => console.log("server is running"))

