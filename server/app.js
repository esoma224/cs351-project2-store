const express = require("express");
const session = require("express-session");
const path = require("path");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.default || connectMongo;
const productRoutes = require("./routes/productRoutes");
const cartRouter = require("./routes/cartRoutes");
const accountRoutes = require("./routes/accountRoutes");
const orderRoutes = require("./routes/orderRoutes");


const createApp = (mongoClient) => {
  const app = express();
  const database = mongoClient.db();

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not set. Check your .env file.");
  }

  app.set("trust proxy", 1);
  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoClient,
        dbName: database.databaseName,
        collectionName: "sessions",
      }),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.locals.db = database;

  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRouter);
  app.use("/api", accountRoutes);
  app.use("/api/orders", orderRoutes);
  

  app.get("/api/status", (req, res) => {
    res.status(200).json({
      message: "The API is running.",
    });
  });
  //Had Help with this
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});


const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(clientBuildPath, "index.html"), (error) => {
    if (error) next(error);
  });
});

  return app;
};

module.exports = createApp;