const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const FollowerModel = require("../models/FollowerModel");
const ProfileModel = require("../models/ProfileModel");
const NotificationModal = require("../models/NotificationModal");
const ChatModel = require("../models/ChatModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const isEmail = require("validator/lib/isEmail");
const { isMoment } = require("moment");

const userPng =
  "https://res.cloudinary.com/indersingh/image/upload/v1593464618/App/user_mklcpl.png";

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

router.get("/:username", async (req, res) => {
  const { username } = req.params;
  console.log("userName", username);
  try {
    if (username.lenght < 1) return res.status(401).send("Invalid");
    if (!regexUserName.test(username)) return res.status(401).send("Invalid");
    const user = await UserModel.findOne({ username: username.toLowerCase() });
    if (user) return res.status(401).send("Username already taken!");
    return res.status(200).send("Available");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

router.post("/", async (req, res) => {
  console.log(req.body);
  const {
    name,
    email,
    username,
    password,
    bio,
    facebook,
    youtube,
    instagram,
    twitter,
  } = req.body.user;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  if (password.length < 6) {
    return res.status(401).send("Password must be atleast 6 characters");
  }

  try {
    let user = await UserModel.findOne({ email: email.toLowerCase() });
    if (user) return res.status(401).send("User already registered");

    user = new UserModel({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      profilePicUrl: req.body.profilePicUrl || userPng,
    });
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    let profileFields = {};

    profileFields.user = user._id;
    profileFields.bio = bio;
    profileFields.social = {};

    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;

    await new ProfileModel(profileFields).save();

    await new FollowerModel({
      user: user._id,
      followers: [],
      following: [],
    }).save();
    await new NotificationModal({ user: user._id, notifications: [] }).save();
    await new ChatModel({ user: user._id, chats: [] }).save();
    const payload = { userId: user._id };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json(token);
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
