const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cartController");

const cartRouter = express.Router();

cartRouter.get("/", getCart);
cartRouter.post("/", addToCart);
cartRouter.put("/:itemId", updateCartItem);
cartRouter.delete("/:itemId", removeCartItem);

module.exports = cartRouter;