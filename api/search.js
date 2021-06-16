const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:searchtext", authMiddleware, async (req, res) => {
  try {
    const { searchtext } = req.params;

    if (searchtext.length === 0) return;

    const results = await UserModel.find({
      name: { $regex: searchtext, $options: "i" },
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;
