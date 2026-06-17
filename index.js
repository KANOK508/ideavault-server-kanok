const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ideavault-client-kanok.vercel.app",
    // Add your deployed frontend URL here
  ],
  credentials: true,
}));
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// JWT Middleware
// ----------------create a verifying token we use this as a function other places   
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  // check with the secret 
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    // await client.connect();

    const db = client.db("ideavaultDB");
    const ideasCollection = db.collection("ideas");
    const commentsCollection = db.collection("comments");
    const usersCollection = db.collection("users");
    const bookmarksCollection = db.collection("bookmarks");

    // ─── AUTH ROUTES ─────────────────────────────────────────────────────────

    // Generate JWT token
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.json({ token });
    });



    // Save user (on login/register)
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existing = await usersCollection.findOne(query);   //   check if the same value have in the userCollection.. 
      if (existing) {
        return res.json({ message: "User already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne({
        ...user,
        createdAt: new Date(),
      });
      res.json(result);
    });
//  get the created users ===now using get --- (when get use dynamic routing )
    // Get user by email
    app.get("/users/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (req.user.email !== email) {
        return res.status(403).json({ message: "Forbidden" });
      }
          //-------
      const user = await usersCollection.findOne({ email });
      res.json(user);
    });

    // Update user profile
    app.patch("/users/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (req.user.email !== email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      //-------
      const updates = req.body;   //get the updata value from font end  
      const result = await usersCollection.updateOne(
        // -------------we don't update the email only   the other value  
        { email },
        { $set: updates }
      );
      res.json(result);
    });

    // ─── IDEAS ROUTES ─────────────────────────────────────────────────────────

    // Get all ideas (with search + filter + sort)
    app.get("/ideas", async (req, res) => {
      const {
        search,
        category,
        dateFrom,
        dateTo,
        sort = "newest",
        page = 1,
        limit = 9,
      } = req.query;

      const query = {};

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      if (category && category !== "all") {
        query.category = category;
      }
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      const sortOption =
        sort === "oldest"
          ? { createdAt: 1 }
          : sort === "popular"
          ? { likes: -1 }
          : { createdAt: -1 };

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await ideasCollection.countDocuments(query);
      const ideas = await ideasCollection
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      res.json({ ideas, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    });

    // Get trending ideas (top 6 by views/likes)
    app.get("/ideas/trending", async (req, res) => {
      const ideas = await ideasCollection
        .find()
        .sort({ likes: -1, createdAt: -1 })
        .limit(6)
        .toArray();
      res.json(ideas);
    });

    // Get single idea by id
    app.get("/ideas/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const idea = await ideasCollection.findOne({ _id: new ObjectId(id) });
      if (!idea) return res.status(404).json({ message: "Idea not found" });
      res.json(idea);
    });

    // Get ideas by user email (My Ideas)
    app.get("/my-ideas/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (req.user.email !== email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const ideas = await ideasCollection
        .find({ authorEmail: email })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(ideas);
    });

    // Post a new idea
    app.post("/ideas", verifyToken, async (req, res) => {
      const idea = {
        ...req.body,
        likes: 0,
        views: 0,
        createdAt: new Date(),
      };
      const result = await ideasCollection.insertOne(idea);
      res.json(result);
    });

    // Update an idea
    app.put("/ideas/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const idea = await ideasCollection.findOne({ _id: new ObjectId(id) });
      if (!idea) return res.status(404).json({ message: "Not found" });
      if (idea.authorEmail !== req.user.email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updates = req.body;
      delete updates._id;
      const result = await ideasCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } }
      );
      res.json(result);
    });

    // Delete an idea
    app.delete("/ideas/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const idea = await ideasCollection.findOne({ _id: new ObjectId(id) });
      if (!idea) return res.status(404).json({ message: "Not found" });
      if (idea.authorEmail !== req.user.email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const result = await ideasCollection.deleteOne({ _id: new ObjectId(id) });
      // Also remove associated comments
      await commentsCollection.deleteMany({ ideaId: id });
      res.json(result);
    });

    // Like / Unlike an idea
    app.patch("/ideas/:id/like", verifyToken, async (req, res) => {
      const id = req.params.id;
      const { action } = req.body; // "like" or "unlike"
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const inc = action === "unlike" ? -1 : 1;
      const result = await ideasCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { likes: inc } }
      );
      res.json(result);
    });

    // ─── COMMENTS ROUTES ──────────────────────────────────────────────────────

    // Get comments for an idea
    app.get("/comments/:ideaId", async (req, res) => {
      const ideaId = req.params.ideaId;
      const comments = await commentsCollection
        .find({ ideaId })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(comments);
    });

    // Get all comments by user (My Interactions)
    app.get("/my-comments/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (req.user.email !== email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const comments = await commentsCollection
        .find({ userEmail: email })
        .sort({ createdAt: -1 })
        .toArray();
      // Enrich with idea titles
      const enriched = await Promise.all(
        comments.map(async (c) => {
          if (ObjectId.isValid(c.ideaId)) {
            const idea = await ideasCollection.findOne(
              { _id: new ObjectId(c.ideaId) },
              { projection: { title: 1 } }
            );
            return { ...c, ideaTitle: idea?.title || "Deleted Idea" };
          }
          return { ...c, ideaTitle: "Unknown" };
        })
      );
      res.json(enriched);
    });

    // Add comment
    app.post("/comments", verifyToken, async (req, res) => {
      const comment = {
        ...req.body,
        createdAt: new Date(),
      };
      const result = await commentsCollection.insertOne(comment);
      res.json(result);
    });

    // Edit comment
    app.patch("/comments/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const comment = await commentsCollection.findOne({ _id: new ObjectId(id) });
      if (!comment) return res.status(404).json({ message: "Not found" });
      if (comment.userEmail !== req.user.email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const result = await commentsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { text: req.body.text, updatedAt: new Date() } }
      );
      res.json(result);
    });

    // Delete comment
    app.delete("/comments/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const comment = await commentsCollection.findOne({ _id: new ObjectId(id) });
      if (!comment) return res.status(404).json({ message: "Not found" });
      if (comment.userEmail !== req.user.email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const result = await commentsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    // ─── BOOKMARKS ROUTES ─────────────────────────────────────────────────────

    // Get bookmarks for user
    app.get("/bookmarks/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (req.user.email !== email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const bookmarks = await bookmarksCollection.find({ userEmail: email }).toArray();
      const ideaIds = bookmarks.map((b) => new ObjectId(b.ideaId));
      const ideas = await ideasCollection.find({ _id: { $in: ideaIds } }).toArray();
      res.json(ideas);
    });

    // Toggle bookmark
    app.post("/bookmarks", verifyToken, async (req, res) => {
      const { userEmail, ideaId } = req.body;
      const existing = await bookmarksCollection.findOne({ userEmail, ideaId });
      if (existing) {
        await bookmarksCollection.deleteOne({ userEmail, ideaId });
        return res.json({ bookmarked: false });
      }
      await bookmarksCollection.insertOne({ userEmail, ideaId, createdAt: new Date() });
      res.json({ bookmarked: true });
    });

    // Health check
    app.get("/", (req, res) => {
      res.json({ message: "IdeaVault server is running 🚀" });
    });

    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`IdeaVault server running on port ${port}`);
});
