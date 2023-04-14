const express = require("express")
const mongoose = require("mongoose")
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors');
const dotenv = require("dotenv")
const app = express()
const bodyParser = require("body-parser")
const compression = require('compression')
const hpp = require('hpp');


const PostsRoutes = require('./Routes/Posts')
const SignUpRoutes = require('./Routes/SignUp')
const SignInRoutes = require('./Routes/SignIn')
const ProfileRoutes = require('./Routes/UserProfile')
const SearchRoutes = require('./Routes/search')
const PeopleRoutes = require('./Routes/People')
const NotificationsRoutes = require('./Routes/Notifications')

dotenv.config()

mongoose.set('strictQuery', false)
mongoose.connect(process.env.DataBase_URL, (err) => {
    if (err) console.log(err)
    else console.log("done")
})


app.use(cors({
    origin: '*'
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

//
app.use("/api/SignUp", SignUpRoutes)
app.use("/api/SignIn", SignInRoutes)
app.use("/api/Profile", ProfileRoutes)
app.use("/api/Posts", PostsRoutes)
app.use("/api/Search", SearchRoutes)
app.use("/api/People", PeopleRoutes)
app.use("/api/Notifications", NotificationsRoutes)

app.get("/stress", async (req, res) => {
    let num = 0
    for (let i = 0; i < 100; i++) {
        num + 1
    }
    res.sendStatus(200)
})


app.listen(process.env.PORT, () => console.log("server is running"))

