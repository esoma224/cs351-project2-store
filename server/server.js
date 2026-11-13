require("dotenv").config();

const { MongoClient } = require("mongodb");
const createApp = require("./app");

const { MONGODB_URI, SESSION_SECRET, PORT = 3000 } = process.env;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from the environment.");
}

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from the environment.");
}

const client = new MongoClient(MONGODB_URI);
let httpServer;

async function start() {
  try {
    await client.connect();

    const app = createApp(client);

    httpServer = app.listen(PORT, () => {
      console.log(`Connected to MongoDB. App listening on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error);

    await client.close().catch(() => {});
    process.exitCode = 1;
  }
}

async function stop() {
  console.log("Stopping the application...");

  if (httpServer) {
    await new Promise((resolve, reject) => {
      httpServer.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  await client.close();
  process.exit(0);
}

process.once("SIGINT", stop);
process.once("SIGTERM", stop);

start();