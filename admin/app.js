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
const { LanguagesModel, RequestSchema } = require("./models");

// TODO : check origins from localhost only
const allowedOrigins = [
  "https://portal.pangea.global",
  "https://vendor.pangea.global",
  "http://localhost:3000",
  "http://localhost:8081"
];

mongoose.connect(config.mongoDB.url);

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
app.use(bodyParser());
app.use(cookieParser());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", true);

  var index = allowedOrigins.indexOf(origin);
  if (index > -1) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigins[index]);
  }

  return next();
});

// include routes
const routes = require("./routes");
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server is working on: ${port}`);
});
