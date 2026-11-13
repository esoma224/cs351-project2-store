const express = require("express");
const requireLogin = require("../middleware/requireLogin");
const {
  createOrder,
  getOrders,
  getOrderById, 
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", requireLogin, createOrder);
router.get("/", requireLogin, getOrders);
router.get("/:id", requireLogin, getOrderById); 

module.exports = router;