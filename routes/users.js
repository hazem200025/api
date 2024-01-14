const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
// Get a user
/*
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  // Validate query parameters
  if (!userId && !username) {
    return res.status(400).json({ error: 'Either userId or username must be provided.' });
  }

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });

    // Handle user not found
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    console.error(err);

    // Handle specific error types if needed
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid userId format.' });
    }

    res.status(500).json({ error: 'Internal Server Error.' });
  }
});
*/
router.get("/", async (req, res) => {
  const { userId, username, job } = req.query;

  // Validate query parameters
  if ((!userId && !username) && !job) {
    return res.status(400).json({ error: 'Either userId, username, or job must be provided.' });
  }

  try {
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (username) {
      user = await User.findOne({ username });
    } else {
      // Fetch users by job if userId and username are not provided
      const usersByJob = await User.find({ job });
      return res.status(200).json(usersByJob);
    }

    // Handle user not found
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    console.error(err);

    // Handle specific error types if needed
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid userId format.' });
    }

    res.status(500).json({ error: 'Internal Server Error.' });
  }
});


//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
