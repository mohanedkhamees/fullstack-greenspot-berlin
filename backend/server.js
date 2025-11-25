require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());

const {
  MONGO_USER,
  MONGO_PASS,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_DB,
  MONGO_COLLECTION,
  PORT
} = process.env;

const uri =
  `mongodb://${MONGO_USER}:${MONGO_PASS}` +
  `@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}` +
  `?authSource=${MONGO_DB}`;

let db;

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(MONGO_DB);
    console.log("🍃 Connected to MongoDB:", MONGO_DB);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectDB();
app.use("/images", express.static("images"));

// GET /locations → Fetch all locations
app.get("/locations", async (req, res) => {
  try {
    const locations = await db.collection(MONGO_COLLECTION).find({}).toArray();
    res.json(locations);
  } catch (err) {
    console.error("❌ Error fetching locations:", err);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Start server
app.listen(PORT || 8000, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
