const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const FollowerModel = require("../models/FollowerModel");
const jwt = require("jsonwebtoken");
const NotificationModal = require("../models/NotificationModal");
const ChatModel = require("../models/ChatModel");
const bcrypt = require("bcryptjs");
const isEmail = require("validator/lib/isEmail");
const { isMoment } = require("moment");
const authMiddleware = require("../middleware/authMiddleware");

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

router.get("/", authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const user = await UserModel.findById(userId);
    const userFollowStatus = await FollowerModel.findOne({ user: userId });
    return res.status(200).json({ user, userFollowStatus });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

router.post("/", async (req, res) => {
  const { email, password } = req.body.user;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");
  if (password.length < 6)
    return res.status(401).send("Password must be at least 6 characters");

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) return res.status(401).send("Invalid Credentials");

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) return res.status(401).send("Invalid Credentials");

    const notificationModal = await NotificationModal.findOne({
      user: user._id,
    });
    if (!notificationModal) {
      await new NotificationModal({ user: user._id, notifications: [] }).save();
    }
    const chatModel = await ChatModel.findOne({
      user: user._id,
    });
    if (!chatModel) {
      await new ChatModel({ user: user._id, chats: [] }).save();
    }
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
