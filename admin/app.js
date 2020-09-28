require('dotenv').config();
const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const config = require("./server-config.json");
const mongoose = require("mongoose");
const port = config.server.port;
const db = mongoose.connection;
const checkCollections = require("./helpers/dbSetDefault");
const { checkRoutes } = require("./middleware/index");
const history = require('connect-history-api-fallback');
let logger = require('morgan');
const { updateMemoqProjectsData } = require('./services/memoqs/projects');
const { getLangReports } = require('./reports/langReport');
const schedule = require('node-schedule');
const { getMemoqUsers } = require('./services/memoqs/users');
const { getProjectUsers } = require('./services/memoqs/projects');

const foo = async () => {
  // const users = await getProjectUsers('');
  // console.log(users);
  // const users = await getMemoqUsers();
  // // const needed = users.filter(user => user.email === 'maxttt@gmail.com' || user.email  === 'maksym@pangea.global' || user.email === 'maxyplmr@gmail.com' );
  // const needed = users.find(user => user.email === 'shadowbroker2176@gmail.com');
  // console.log(needed);
}

// foo();

schedule.scheduleJob('0 */3 * * *', async function () {
  console.log('------ Start updating memoq projects data: ', `${new Date()} ------`);
  try {
    await updateMemoqProjectsData();
    console.log('------ Finish updating memoq projects data ', `${new Date()} ------`);
  } catch(err) {
    console.log(err.message);
  }
});

schedule.scheduleJob('30 23 * * *', async function () {
  console.log('------- Start updating lang tier data: ', `${new Date()} -------`);
  try {
    await getLangReports();
    console.log('------- Finish updating lang tier data: ', `${new Date()} --------`);
  } catch (err) {
    console.log(err.message);
  }
});


const allowedOrigins = [
  "https://admin.pangea.global",
  "https://vendor.pangea.global",
  "https://portal.pangea.global",
  "http://localhost:3000",
  "http://localhost:3002",
  "http://localhost:8081",
  "http://testadmin.pangea.global",
  "http://testvendor.pangea.global",
  "http://testportal.pangea.global",
  "http://95.216.165.38"
];

mongoose.connect(config.mongoDB.url, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true
});

app.use(logger('dev'));
app.use(
  session({
    secret: "Cookies Very Much secret key!",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
  })
);

app.use(express.static("dist"));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Authorization, token-header"
  );
  res.header("Access-Control-Allow-Credentials", true);

  const index = allowedOrigins.indexOf(origin);
  if (index > -1) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigins[index]);
  }

  return next();
});

// include routes
const routes = require("./routes");
app.use("/", routes);

app.use((err, req, res, next) => {
  return res.status(err.status).send(err.message);
});

app.use(history({ verbose: true, index: '/' }));
app.use(checkRoutes);

app.listen(port, () => {
  console.log(`Server is working on: ${port}`);
});
