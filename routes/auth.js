const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // Set your upload directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage: storage });

router.post("/register", upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'coverPicture', maxCount: 1 }]), async (req, res) => {
  try {
    // Generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
     // Extract filenames from paths
     const profilePicturePath = req.files['profilePicture'][0].path;
     const coverPicturePath = req.files['coverPicture'][0].path;
 
     // Extract file names
     const profilePictureName = profilePicturePath.split('\\').pop(); // Extracts the file name from the path
     const coverPictureName = coverPicturePath.split('\\').pop(); // Extracts the file name from the path

    // Create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      profilePicture: profilePictureName, // Save path of profile picture
      coverPicture: coverPictureName, // Save path of cover picture
      job: req.body.job,
      location: req.body.location,
    });

    // Save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Handle file not found error here
      res.status(404).json({ error: 'File not found or directory path incorrect' });
    } else {
      // Handle other errors
      res.status(500).json(err);
    }
  }
});


//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    !validPassword && res.status(400).json("wrong password")

    res.status(200).json(user)
  } catch (err) {
    res.status(500).json(err)
  }
});

// Assuming you already have an authentication middleware that verifies the token

// Add a route for logging out
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});


module.exports = router;