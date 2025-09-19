const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const cors = require("cors");
const app = express();
require('dotenv').config();

const { app: { host, port } } = require('./configs');

let corsOptions = {
  origin: [`http://${host}:${port}`, `https://${host}:${port}`],
  credentials: true, // Allow credentials (cookies)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '60mb' }));
app.use(bodyParser.urlencoded({ limit: '60mb', extended: true }));
app.use(cookieParser())
app.use('/static', express.static('static'))
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

// Require and start all routes
// require('./routes')(app);


// Import the sync function
const { sync } = require("./models");

sync().then(() => { console.log('Database initialized') }).catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});


// HTTP server for development
app.listen(port, host, () => {
  console.log(`Server is listening on http://${host}:${port}`);
});