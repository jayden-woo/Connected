require('dotenv').config()
const mongoose = require('mongoose')
const debug = require('debug')('app:db');

// database login is retrieved from environment variables
CONNECTION_STRING = "mongodb+srv://<username>:<password>@team-connected.94ydr.mongodb.net/CRM?retryWrites=true&w=majority"
MONGO_URL = CONNECTION_STRING.replace("<username>", process.env.MONGO_USERNAME).replace("<password>", process.env.MONGO_PASSWORD)

// connect to MongoDB
mongoose.connect(MONGO_URL || "mongodb://localhost", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  dbName: "CRM"
})

const db = mongoose.connection

db.on('error', err => {
  console.error('Could not connect to MongoDB...', err);
  process.exit(1)
})

db.once('open', async () => {
  debug("Mongo connection started on " + db.host + ":" + db.port)
})

