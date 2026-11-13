# CS351 Project 2 StoreFront

## Project Overview
A full-stack online store built by extending our Project 1 React application.
The React frontend uses an Express REST API. MongoDB Atlas stores products,
user accounts, and orders. Passwords are hashed, and the shopping cart is
stored in an Express session.

## Group Members
-Esma Murshed

-Jefferson Ly

## Live Website
[https://cs351-store-528777533929.us-west1.run.app/)

## Technology
- React and Vite
- Node.js and Express
- MongoDB Atlas
- Express sessions
- Google Cloud Run

## Build

From the project root, build the React client:

```bash
cd client
npm install
npm run build
cd ..
```

The build output is saved in `client/dist`. The Express server serves these files in production.

## Run Locally

Open two terminals in VS Code.

**Terminal 1 — start the server:**

```bash
cd server
npm install
node server.js
```

**Terminal 2 — start the client:**

```bash
cd client
npm install
npm run dev
```

Open the local URL Vite prints in Terminal 2. Keep `server/.env` private. Do not commit it to GitHub.

## Deploy to Google Cloud Run

From the project root, build and deploy the app as one Cloud Run service:

```bash
gcloud run deploy cs351-store \
  --source . \
  --region us-west1 \
  --allow-unauthenticated
```
## Deployment Instructions

```bash
git add README.md
git commit -m "Document build and deployment"
git push
```
After deployment, open your Cloud Run service URL and check that the store loads.

