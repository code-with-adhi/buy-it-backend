const User = require("../models/user.model.js");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admin role required." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during admin check." });
  }
};

module.exports = adminMiddleware;
