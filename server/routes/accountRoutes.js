const express = require("express");
const requireLogin = require("../middleware/requireLogin");
const {
  createAccount,
  loginAccount,
  getAccount,
  updateAccountDetails,
  logoutAccount,
} = require("../controllers/accountController");

const router = express.Router();

router.post("/accounts", createAccount);
router.post("/login", loginAccount);
router.get("/account", requireLogin, getAccount);
router.put("/account", requireLogin, updateAccountDetails);
router.post("/logout", logoutAccount);

module.exports = router;