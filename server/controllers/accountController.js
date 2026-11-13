const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

async function createAccount(req, res) {
  try {
    const login =
      typeof req.body.login === "string" ? req.body.login.trim() : "";
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!login || !email || !password) {
      return res.status(400).json({
        message: "Login, email, and password are required.",
      });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    const users = req.app.locals.db.collection("users");
    const existingUser = await users.findOne({
      $or: [{ login }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "That login or email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await users.insertOne({
      login,
      email,
      passwordHash,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Account created. Please log in.",
    });
  } catch (error) {
    console.error("Account creation failed:", error.message);
    return res.status(500).json({
      message: "Could not create account.",
    });
  }
}

async function loginAccount(req, res) {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const users = req.app.locals.db.collection("users");
    const user = await users.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    req.session.userId = user._id.toString();

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        login: user.login,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({
      message: "Could not log in.",
    });
  }
}
async function getAccount(req, res) {
  try {
    
    if (!ObjectId.isValid(req.session?.userId)) {
      return res.status(401).json({ message: "Please log in first." });
    }

    const account = await req.app.locals.db.collection("users").findOne(
      { _id: new ObjectId(req.session.userId) },
      { projection: { passwordHash: 0 } } 
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

   
    return res.status(200).json({
      account: {
        id: account._id.toString(),
        login: account.login,
        email: account.email,
        phone: account.phone || "",
        shippingAddress: account.shippingAddress || {},
      },
    });
  } catch (error) {
    console.error("Could not load account:", error.message);
    return res.status(500).json({ message: "Could not load account." });
  }
}

function logoutAccount(req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout failed:", error.message);
      return res.status(500).json({ message: "Could not log out." });
    }

    res.clearCookie("connect.sid");
    return res.json({ message: "You are logged out." });
  });
}
async function updateAccountDetails(req, res) {
  try {
    if (!ObjectId.isValid(req.session?.userId)) {
      return res.status(401).json({ message: "Please log in first." });
    }

    const phone =
      typeof req.body.phone === "string" ? req.body.phone.trim() : "";
    const address = req.body.shippingAddress || {};

    const street =
      typeof address.street === "string" ? address.street.trim() : "";
    const city =
      typeof address.city === "string" ? address.city.trim() : "";
    const state =
      typeof address.state === "string" ? address.state.trim() : "";
    const zip =
      typeof address.zip === "string" ? address.zip.trim() : "";

    if (!phone || !street || !city || !state || !zip) {
      return res.status(400).json({
        message: "Phone and all shipping address fields are required.",
      });
    }

    const users = req.app.locals.db.collection("users");
    const userId = new ObjectId(req.session.userId);

    const updateResult = await users.updateOne(
      { _id: userId },
      {
        $set: {
          phone,
          shippingAddress: { street, city, state, zip },
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Account not found." });
    }

    const account = await users.findOne(
      { _id: userId },
      { projection: { passwordHash: 0 } }
    );

    return res.status(200).json({
      message: "Account updated.",
      account,
    });
  } catch (error) {
    console.error("Account update failed:", error.message);
    return res.status(500).json({
      message: "Could not update account.",
    });
  }
}

module.exports = {
  createAccount,
  loginAccount,
  getAccount,
  updateAccountDetails,
  logoutAccount,
};