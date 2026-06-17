# IdeaVault Server

Hi ! this is my ideaVault but for everyone  to learn a new think and share your ideas and thoughts.. 

The most --> highlighted features is 
         You can add your ideas category wise 
         See others ideas 
         comment on others ideas 

 > Implement with Express.js REST API with MongoDB    And  for signup , login use firebase authentication try a new things  ----also use axios for easy implementation 
> Handles ideas, comments, users, bookmarks, and JWT authentication.


---

## 🗂️ Folder Structure

```
ideavault-server/
├── index.js            ← All routes and MongoDB logic (single-file Express app)
├── vercel.json         ← Vercel serverless deployment configuration
├── .env                ← Your local secrets (never commit this!)
├── .env.example        ← Template — copy to .env and fill in values
├── .gitignore          ← Ignores node_modules and .env
├── package.json        ← Dependencies and npm scripts
└── README.md           ← This file
```

---

## 🔌 All API Endpoints

### Auth
| Method | Route | Auth Required | Description |
|--------|-------|:---:|-------------|
| POST | `/jwt` | ✗ | Generate JWT token (call after Firebase login) |
| POST | `/users` | ✗ | Save or skip user on login/register |
| GET | `/users/:email` | ✓ | Get user profile data |
| PATCH | `/users/:email` | ✓ | Update user profile |

### Ideas
| Method | Route | Auth Required | Description |
|--------|-------|:---:|-------------|
| GET | `/ideas` | ✗ | All ideas — supports `search`, `category`, `sort`, `page`, `limit` |
| GET | `/ideas/trending` | ✗ | Top 6 ideas by likes + recency |
| GET | `/ideas/:id` | ✗ | Single idea by MongoDB ObjectId |
| GET | `/my-ideas/:email` | ✓ | Ideas belonging to a specific user |
| POST | `/ideas` | ✓ | Create a new idea |
| PUT | `/ideas/:id` | ✓ | Update an idea (owner only) |
| DELETE | `/ideas/:id` | ✓ | Delete an idea + its comments (owner only) |
| PATCH | `/ideas/:id/like` | ✓ | Like or unlike — send `{ "action": "like" }` or `"unlike"` |

### Comments
| Method | Route | Auth Required | Description |
|--------|-------|:---:|-------------|
| GET | `/comments/:ideaId` | ✗ | All comments for an idea |
| GET | `/my-comments/:email` | ✓ | User's comment history (enriched with idea titles) |
| POST | `/comments` | ✓ | Add a comment |
| PATCH | `/comments/:id` | ✓ | Edit a comment (owner only) |
| DELETE | `/comments/:id` | ✓ | Delete a comment (owner only) |

### Bookmarks
| Method | Route | Auth Required | Description |
|--------|-------|:---:|-------------|
| GET | `/bookmarks/:email` | ✓ | Get all bookmarked ideas for a user |
| POST | `/bookmarks` | ✓ | Toggle bookmark — bookmarks if new, removes if exists |

### Health
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Returns `{ "message": "IdeaVault server is running 🚀" }` |

---

## ⚙️ MongoDB Collections

| Collection | Purpose |
|------------|---------|
| `users` | Stores user profile data (email, name, photo) |
| `ideas` | All startup ideas with metadata |
| `comments` | Comments linked to ideas by `ideaId` |
| `bookmarks` | Pairs of `{userEmail, ideaId}` |

### Idea Document Shape

```json
{
  "_id": "ObjectId",
  "title": "My Startup Idea",
  "shortDescription": "One-liner summary",
  "detailedDescription": "Full explanation...",
  "category": "Tech",
  "tags": ["saas", "ai"],
  "imageURL": "https://...",
  "estimatedBudget": "$50K–$200K",
  "targetAudience": "Small business owners",
  "problemStatement": "The problem...",
  "proposedSolution": "The solution...",
  "authorName": "Jane Doe",
  "authorEmail": "jane@example.com",
  "authorPhoto": "https://...",
  "likes": 0,
  "views": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Comment Document Shape

```json
{
  "_id": "ObjectId",
  "ideaId": "string (idea _id)",
  "text": "Great concept!",
  "userEmail": "jane@example.com",
  "userName": "Jane Doe",
  "userPhoto": "https://...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔐 JWT Authentication

1. Client calls `POST /jwt` with `{ email }` after Firebase login
2. Server signs a 7-day JWT with `JWT_SECRET` and returns `{ token }`
3. Client stores token in `localStorage` as `ideavault-token`
4. All protected routes read `Authorization: Bearer <token>` header
5. Server verifies the token with the `verifyToken` middleware

---

## 🛠️ Prerequisites

- Node.js v18+ → https://nodejs.org
- A free MongoDB Atlas account → https://cloud.mongodb.com

---

## 🍃 Step 1 — MongoDB Atlas Setup

1. Sign up at https://cloud.mongodb.com
2. **Create a Free M0 Cluster** (AWS recommended)
3. **Database Access → Add New Database User:**
   - Username: `ideavaultAdmin`
   - Password: strong password (save it!)
   - Role: **Atlas Admin**
4. **Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`)
5. **Clusters → Connect → Drivers** → copy the connection string
6. Modify the string — add `/ideavaultDB` before `?`:
   ```
   Before: ...mongodb.net/?retryWrites=true
   After:  ...mongodb.net/ideavaultDB?retryWrites=true
   ```

---

## ⚙️ Step 2 — Configure Environment

```bash
cd ideavault-server
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb+srv://ideavaultAdmin:YourPassword@cluster0.xxxxx.mongodb.net/ideavaultDB?retryWrites=true&w=majority
JWT_SECRET=makethisatleast32charslong_andsupersecret_neverShareThis
PORT=5000
```

**Tips for `JWT_SECRET`:**
- Use a long random string (32+ characters)
- Never share it publicly
- Generate one: https://generate-secret.vercel.app/32

> ⚠️ `.env` is in `.gitignore` — never commit it to GitHub

---

## 🚀 Step 3 — Run Locally

```bash
cd ideavault-server
npm install
npm run dev
```

Test in your browser: http://localhost:5000  
You should see: `{ "message": "IdeaVault server is running 🚀" }`

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Run with nodemon (auto-restart on save) |
| Production | `npm start` | Run with plain node |

---

## 🌍 Deploy to Vercel

### 1. Push to GitHub

```bash
cd ideavault-server
git init
git add .
git commit -m "Initial commit: IdeaVault API server"
git remote add origin https://github.com/YOUR_USERNAME/ideavault-server.git
git push -u origin main
```

> Make sure `.env` is **not** pushed (it's in `.gitignore` ✔)

### 2. Import to Vercel

1. Go to https://vercel.com → **New Project** → Import the server repo
2. Vercel auto-detects the `vercel.json` config ✔
3. Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Full MongoDB connection string (with password and database name) |
| `JWT_SECRET` | Your secret key (same one in `.env`) |

4. Leave `PORT` out — Vercel manages ports automatically
5. Click **Deploy** → wait ~1 minute

### 3. Test the Deployed API

Open your Vercel URL in a browser:
```
https://your-server.vercel.app/
```
Should return: `{ "message": "IdeaVault server is running 🚀" }`

### 4. Add Client Origin to CORS

After deploying the client, open `index.js` and update the CORS `origin` array:

```js
origin: [
  "http://localhost:3000",
  "https://your-ideavault-client.vercel.app",   // ← add this
],
```

Commit and push — Vercel will auto-redeploy.

---

## 📝 GitHub Commits (Assignment Requirement: 8+)

```bash
git commit -m "Initialize Express server with CORS and dotenv"
git commit -m "Connect MongoDB Atlas with MongoClient"
git commit -m "Add JWT middleware for protected routes"
git commit -m "Implement users endpoints (save, get, update)"
git commit -m "Add ideas CRUD endpoints with ownership validation"
git commit -m "Implement search, filter by category, sort, and pagination"
git commit -m "Add trending ideas endpoint using $limit and sort"
git commit -m "Implement comments endpoints with CRUD and ownership"
git commit -m "Add bookmarks toggle endpoint"
git commit -m "Configure Vercel serverless deployment"
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoServerError: bad auth` | Wrong password in `MONGODB_URI` — check for special chars, URL-encode them |
| `MongoNetworkError: connect ECONNREFUSED` | IP not whitelisted in Atlas — add `0.0.0.0/0` |
| `403 Forbidden` on API calls | JWT token doesn't match — check `JWT_SECRET` is same on client and server |
| `Invalid ID` error | Passing non-ObjectId strings — check the id parameter is a valid MongoDB ObjectId |
| CORS errors on frontend | Add the client domain to the `origin` array in `index.js` |
| Vercel 404 on all routes | Check `vercel.json` has the catch-all route `"src": "/(.*)"` pointing to `index.js` |
| `cannot GET /ideas/trending` before `/ideas/:id` | Route order matters — `trending` is already defined before `:id` in `index.js` ✔ |

---

## 🔒 Security Notes

- All mutating routes (POST/PUT/DELETE/PATCH) require a valid JWT
- Ownership is verified on update/delete — users can only modify their own data
- The `verifyToken` middleware checks `req.user.email` matches the resource owner
- MongoDB ObjectIds are validated before queries to prevent injection
- Environment variables are never logged or exposed in responses
