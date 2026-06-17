Here is a cleanly organized, humanized version of your `README.md` for the **IdeaVault Server**. All dense, robotic markdown tables have been converted into clean, readable bullet points and logical sections that look professional and natural.

---

# 💡 IdeaVault Server

Express.js REST API with MongoDB built to power the IdeaVault startup idea sharing platform. This backend handles everything from system routing for startup ideas and comments to user bookmark tracking and secure JWT verification.

* **Live API Link:** `https://ideavault-server-kanok.vercel.app` *(Replace with your live URL after deploying)*
* **Client Frontend Repository:** `https://github.com/KANOK508/ideavault-client-kanok`

---

## 🔌 API Endpoints Reference

### 🔐 Authentication & Users

* **POST `/jwt**` *(Public)* — Generates and signs a 7-day secure access token after a user signs in via Firebase.
* **POST `/users**` *(Public)* — Saves a new user profile to MongoDB or skips registration if the email already exists.
* **GET `/users/:email**` *(Private)* — Fetches the account profile details for a specific user.
* **PATCH `/users/:email**` *(Private)* — Updates custom profile data like name and photo URL.

### 💡 Startup Ideas Hub

* **GET `/ideas**` *(Public)* — Fetches listings with full support for search queries, category filters, sorting rules, and pagination.
* **GET `/ideas/trending**` *(Public)* — Returns the top 6 trending ideas based on total likes and recent activity.
* **GET `/ideas/:id**` *(Public)* — Looks up and returns a single idea using its unique MongoDB ObjectId.
* **GET `/my-ideas/:email**` *(Private)* — Lists only the ideas created by a specific logged-in user.
* **POST `/ideas**` *(Private)* — Submits a brand-new startup idea to the community feed.
* **PUT `/ideas/:id**` *(Private)* — Modifies an existing idea entry *(Strictly restricted to the original author)*.
* **DELETE `/ideas/:id**` *(Private)* — Completely removes an idea and instantly clears out all of its associated comments *(Author only)*.
* **PATCH `/ideas/:id/like**` *(Private)* — Toggles a user's like/unlike action on an idea listing.

### 💬 Community Interactions (Comments & Bookmarks)

* **GET `/comments/:ideaId**` *(Public)* — Fetches the complete comment discussion feed for a specific idea.
* **GET `/my-comments/:email**` *(Private)* — Shows a user's entire commenting history along with the corresponding idea titles.
* **POST `/comments**` *(Private)* — Appends a new user comment to an idea.
* **PATCH `/comments/:id**` *(Private)* — Edits a previous comment's text field *(Comment owner only)*.
* **DELETE `/comments/:id**` *(Private)* — Removes a comment entry from the database *(Comment owner only)*.
* **GET `/bookmarks/:email**` *(Private)* — Gathers a clean collection of all ideas bookmarked by a user.
* **POST `/bookmarks**` *(Private)* — Handles the bookmark toggle system: automatically saves if it's new, and deletes the bookmark if clicked again.

### 🩺 System Health Check

* **GET `/**` *(Public)* — Basic server heartbeat route. Returns: `{ "message": "IdeaVault server is running 🚀" }`

---

## ⚙️ MongoDB Architecture

Your data is split cleanly into **4 primary collections**:

1. **`users`** — Tracks critical user footprint identities (`email`, `name`, `photo`).
2. **`ideas`** — Holds complete structural parameters for every startup listing.
3. **`comments`** — Connects conversational text nodes to ideas using explicit `ideaId` strings.
4. **`bookmarks`** — Stores reference mapping pairs containing a user's email linked to an idea ID.

---
those packages we use in this full project 
{
  "name": "ideavault-server",
  "version": "1.0.0",
  "description": "IdeaVault backend API server",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongodb": "^6.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}


## 🛠️ Local Development Setup

Follow these simple steps to spin up the API server on your computer:

### 1. Download Dependencies

Navigate into your directory path and run the setup install:

```bash
cd ideavault-server
npm install

```

### 2. Configure Environment Variables

Create a local text file named exactly **`.env`** in the root directory and add your real connection keys:

```env
MONGODB_URI=mongodb+srv://ideavaultAdmin:YourActualPassword@cluster0.xxxxx.mongodb.net/ideavaultDB?retryWrites=true&w=majority
JWT_SECRET=add_a_highly_secure_random_string_here_at_least_32_characters
PORT=5000

```

> ⚠️ **Security Reminder:** Your `.env` file is protected by your `.gitignore` configuration and will never be pushed up to GitHub.

### 3. Launch the Server

```bash
npm run dev

```

Your server will start up locally. Open your browser to `http://localhost:5000` to verify that everything responds cleanly.

---

## 🌍 Quick Troubleshooting Reference

* **Receiving a `MongoServerError: bad auth` message?** Double-check your database password string inside `.env`. If it contains any special characters, make sure they are properly URL-encoded.
* **Hitting a `MongoNetworkError` crash?** Log into your MongoDB Atlas web dashboard under Network Access and make sure your IP Whitelist is configured to open access from anywhere (`0.0.0.0/0`).
* **Encountering CORS errors on your frontend client?** Remember to open your server's main `index.js` file and verify your production Vercel frontend URL has been successfully included inside the CORS `origin` tracking array.

---
