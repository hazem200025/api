const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const searchRoutes = require('./routes/searchRoutes');
const router = express.Router();
const cors = require('cors');
const path = require("path");
dotenv.config();
mongoose.connect(
  "mongodb://hazgame96:7Yt5Oaf02tsXN8gx@ac-zwyjpdr-shard-00-00.1oznldw.mongodb.net:27017,ac-zwyjpdr-shard-00-01.1oznldw.mongodb.net:27017,ac-zwyjpdr-shard-00-02.1oznldw.mongodb.net:27017/?ssl=true&replicaSet=atlas-z62pow-shard-0&authSource=admin&retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);
app.use("/images", express.static(path.join(__dirname, "public/images")));

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected!');
});

mongoose.connection.on('error', err => {
  
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});


//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/public/images", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use('/api/search', searchRoutes);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
// CORS middleware
app.use((req, res, next) => {
  // Allow any origin during development
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Other CORS headers
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // Continue to the next middleware
  next();
});
app.use(cors({ origin: '*' }));
app.listen(process.env.PORT||8800, () => {
  console.log("Backend server is running!");
});
