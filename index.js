const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const cors = require('cors');
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const searchRoutes = require('./routes/searchRoutes');
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
    return res.status(200).json("File uploaded successfully");
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

// Middleware to handle CORS
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // If your requests include credentials such as cookies
  optionsSuccessStatus: 204, // Handle preflight requests
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  maxAge: 86400, // 1 day
}));

app.listen(process.env.PORT || 8800, () => {
  console.log("Backend server is running!");
});
