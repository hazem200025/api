// searchController.js
const User = require('../models/User');
const Post = require('../models/Post');

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).select('username profilePicture');

    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    const posts = await Post.find({
      $or: [
        { desc: { $regex: query, $options: 'i' } },
        // Add other search criteria for posts if needed
      ],
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
