const express = require("express");
const authMiddleware = require("../middleware/auth.middleware.js");
const User = require("../models/user.model.js");
const Product = require("../models/product.model.js");

const router = express.Router();

router.post("/add", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();
    const populatedCart = await user.populate("cart.productId");
    res.status(200).json(populatedCart.cart);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.productId");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user.cart);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

router.post("/update-quantity", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    const itemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1 && quantity > 0) {
      user.cart[itemIndex].quantity = quantity;
      await user.save();
      const populatedCart = await user.populate("cart.productId");
      res.status(200).json(populatedCart.cart);
    } else {
      res
        .status(400)
        .json({ message: "Item not in cart or invalid quantity." });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

router.post("/remove", authMiddleware, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;
  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { cart: { productId: productId } },
    });
    const updatedUser = await User.findById(userId).populate("cart.productId");
    res.status(200).json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
