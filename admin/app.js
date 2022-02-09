require('dotenv').config();
const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const db = mongoose.connection;
const { checkRoutes } = require('./middleware/index');
const history = require('connect-history-api-fallback');
let logger = require('morgan');
const { checkCollections } = require('./helpers/dbSetDefault');
require('./schedule');
const env = process.env

//NEW DB

checkCollections()

const allowedOrigins = [
	"https://admin.pangea.global",
	"https://vendor.pangea.global",
	"https://portal.pangea.global",
	"http://localhost:3000",
	"http://localhost:3002",
	"http://localhost:8081",
	"https://testadmin.pangea.global",
	"https://testvendor.pangea.global",
	"https://testportal.pangea.global",
	// env.ADMIN_URL,
	// env.PORTAL_URL,
	// env.VENDOR_URL,
	env.WORDPRESS_URL,
];

mongoose.connect(env.MONGO_URL, {
	useNewUrlParser: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
	useCreateIndex: true
});

app.use(logger(env.LOGGER_FORMAT));
app.use(
		session({
			secret: env.SESSION_SECRET,
			resave: true,
			saveUninitialized: false,
			store: new MongoStore({
				mongooseConnection: db
			})
		})
);

app.use(express.static(env.EXPRESS_STATIC));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
	const origin = req.headers.origin;
	res.header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, token-header");
	res.header("Access-Control-Allow-Credentials", true);

	const index = allowedOrigins.indexOf(origin);
	if(index > -1) res.setHeader("Access-Control-Allow-Origin", allowedOrigins[index]);

	return next();
});

const routes = require("./routes");
app.use("/", routes);

app.use((err, req, res, next) => {
	return res.status(err.status).send(err.message);
});

app.use(history({ verbose: true, index: '/' }));
app.use(checkRoutes);

const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: env.ADMIN_URL + ":*",
    methods: ["GET", "POST"]
  },
  secure: true,
  allowEIO3: true
})

io.on('connection', socket => {
  socket.on('updatedVendorData', (data)=>{
    socket.broadcast.emit('setFreshVendorData', data)
  })
  socket.on('updatedClientData', (data)=>{
    socket.broadcast.emit('refreshClientData', data)
  })
  socket.on('updateVendorProp', (data)=>{
    socket.broadcast.emit('socketUpdateVendorProp', data)
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', socket.id)
  })
})

httpServer.listen(env.EXPRESS_PORT, () => {
	console.log('\x1b[32m', `✈  Server is working on: ${ env.EXPRESS_PORT }`, '\x1b[0m');
});
