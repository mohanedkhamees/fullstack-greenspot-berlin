require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { MongoClient, ObjectId } = require("mongodb");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(cors());
app.use(express.json());

const {
  MONGO_USER,
  MONGO_PASS,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_DB,
  MONGO_COLLECTION,
  PORT,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

// Configure Cloudinary
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

const uri =
  `mongodb://${MONGO_USER}:${MONGO_PASS}` +
  `@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}` +
  `?authSource=${MONGO_DB}`;

let db;

function normalizeLocation(location) {
  if (!location) return null;
  const { _id, ...rest } = location;
  return { _id: _id.toString(), ...rest };
}

function buildIdQuery(id) {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  }
  return { _id: id };
}

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(MONGO_DB);
  } catch (err) {
    // Connection error handled silently
  }
}
connectDB();
// Keep static images route for backward compatibility with existing images
app.use("/images", express.static("images"));

// Use memory storage for Cloudinary uploads
const upload = multer({ storage: multer.memoryStorage() });

// Function to upload image to Cloudinary
async function uploadImageToCloudinary(imageBuffer, filename) {
  return new Promise((resolve, reject) => {
    // Generate unique public_id with timestamp to avoid conflicts
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const sanitizedFilename = filename.replace(/\s+/g, "_").replace(/\.[^/.]+$/, "");
    const publicId = `${timestamp}_${randomSuffix}_${sanitizedFilename}`;
    
    const uploadOptions = {
      folder: "berlin-wandel",
      public_id: publicId,
      resource_type: "image",
      // Remove overwrite option to avoid signature issues
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      })
      .end(imageBuffer);
  });
}

// Default image URL (you can upload a default image to Cloudinary and use its URL)
const DEFAULT_IMAGE_URL = "https://res.cloudinary.com/dnqms2vje/image/upload/v1768855945/berlin-wandel/No-Image.png";

// POST /auth/login → Login endpoint
app.post("/auth/login", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await db.collection("User").findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Return user data without password
    res.json({
      username: user.username,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /locations → Fetch all locations
app.get("/locations", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const locations = await db.collection(MONGO_COLLECTION).find({}).toArray();
    res.json(locations.map((loc) => normalizeLocation(loc)));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// GET /locations/:id → Fetch single location
app.get("/locations/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    const id = req.params.id;

    let location;
    try {
      location = await db.collection(MONGO_COLLECTION).findOne(buildIdQuery(id));
    } catch (idError) {
      return res.status(400).json({ error: "Invalid location ID" });
    }

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json(normalizeLocation(location));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

// POST /locations → Create new location (admin only)
app.post("/locations", upload.single("image"), async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    // Check if user is admin via x-role header
    const userRole = req.headers["x-role"];

    if (userRole !== "admin") {
      return res.status(403).json({ error: "Access denied. Only admins can create locations." });
    }

    const locationData = req.body;
    const imageFile = req.file;

    const parsedLatitude = parseFloat(locationData.latitude);
    const parsedLongitude = parseFloat(locationData.longitude);
    const parsedDate = locationData.date ? parseInt(locationData.date, 10) : Date.now();
    const parsedZip = locationData.zip ? parseInt(locationData.zip, 10) : undefined;
    const parsedTags =
      typeof locationData.tags === "string"
        ? locationData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : Array.isArray(locationData.tags)
          ? locationData.tags
          : [];

    // Validate required fields
    if (
      !locationData.title ||
      !locationData.user ||
      !locationData.danger ||
      !locationData.time_category ||
      Number.isNaN(parsedLatitude) ||
      Number.isNaN(parsedLongitude)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload image to Cloudinary if provided
    let imageUrl = DEFAULT_IMAGE_URL;
    if (imageFile && imageFile.buffer && imageFile.buffer.length > 0) {
      // Check if Cloudinary is configured
      if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        try {
          imageUrl = await uploadImageToCloudinary(imageFile.buffer, imageFile.originalname);
        } catch (uploadError) {
          // Continue with default image
          imageUrl = DEFAULT_IMAGE_URL;
        }
      }
    }

    // Insert into database with Cloudinary URL
    const result = await db.collection(MONGO_COLLECTION).insertOne({
      ...locationData,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      date: parsedDate,
      zip: Number.isNaN(parsedZip) ? locationData.zip : parsedZip,
      tags: parsedTags.map((tag) => ({ tag })),
      images: [{ image: imageUrl }], // Store the Cloudinary URL
    });

    // Fetch the created location
    const newLocation = await db
      .collection(MONGO_COLLECTION)
      .findOne({ _id: result.insertedId });

    res.status(201).json(normalizeLocation(newLocation));
  } catch (err) {
    res.status(500).json({ error: "Failed to create location" });
  }
});

// PUT /locations/:id → Update location (only the creator can update)
app.put("/locations/:id", upload.single("image"), async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const requestUsername = req.headers["x-username"];
    if (!requestUsername) {
      return res.status(403).json({ error: "Access denied. Username required." });
    }

    const id = req.params.id;
    const existingLocation = await db
      .collection(MONGO_COLLECTION)
      .findOne(buildIdQuery(id));

    if (!existingLocation) {
      return res.status(404).json({ error: "Location not found" });
    }

    if (existingLocation.user !== requestUsername) {
      return res.status(403).json({
        error: "Access denied. Only the creator of this location can update it.",
      });
    }

    const locationData = req.body;
    const imageFile = req.file;

    const parsedLatitude = parseFloat(locationData.latitude);
    const parsedLongitude = parseFloat(locationData.longitude);
    const parsedDate = locationData.date ? parseInt(locationData.date, 10) : Date.now();
    const parsedZip = locationData.zip ? parseInt(locationData.zip, 10) : undefined;
    const parsedTags =
      typeof locationData.tags === "string"
        ? locationData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : Array.isArray(locationData.tags)
          ? locationData.tags
          : [];

    if (
      !locationData.title ||
      !locationData.user ||
      !locationData.danger ||
      !locationData.time_category ||
      Number.isNaN(parsedLatitude) ||
      Number.isNaN(parsedLongitude)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updateData = {
      title: locationData.title,
      longitude: parsedLongitude,
      latitude: parsedLatitude,
      date: parsedDate,
      category: locationData.category || "",
      description: locationData.description || "",
      street: locationData.street || "",
      zip: Number.isNaN(parsedZip) ? locationData.zip || "" : parsedZip,
      city: locationData.city || "",
      country: locationData.country || "",
      user: locationData.user || "",
      danger: locationData.danger || "",
      time_category: locationData.time_category || "",
      tags: parsedTags.map((tag) => ({ tag })),
    };

    // Update image only if a new image is uploaded
    if (imageFile && imageFile.buffer && imageFile.buffer.length > 0) {
      // Check if Cloudinary is configured
      if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        try {
          const imageUrl = await uploadImageToCloudinary(imageFile.buffer, imageFile.originalname);
          updateData.images = [{ image: imageUrl }];
        } catch (uploadError) {
          // Keep existing images
          updateData.images = existingLocation.images || [{ image: DEFAULT_IMAGE_URL }];
        }
      } else {
        updateData.images = existingLocation.images || [{ image: DEFAULT_IMAGE_URL }];
      }
    } else {
      // Keep existing images (could be Cloudinary URL or old local filename)
      updateData.images = existingLocation.images || [{ image: DEFAULT_IMAGE_URL }];
    }

    const result = await db
      .collection(MONGO_COLLECTION)
      .updateOne(buildIdQuery(id), { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    const updatedLocation = await db
      .collection(MONGO_COLLECTION)
      .findOne(buildIdQuery(id));

    res.json(normalizeLocation(updatedLocation));
  } catch (err) {
    res.status(500).json({ error: "Failed to update location" });
  }
});

// DELETE /locations/:id → Delete location (only the creator can delete)
app.delete("/locations/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const requestUsername = req.headers["x-username"];
    if (!requestUsername) {
      return res.status(403).json({ error: "Access denied. Username required." });
    }

    const id = req.params.id;
    const location = await db
      .collection(MONGO_COLLECTION)
      .findOne(buildIdQuery(id));

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    if (location.user !== requestUsername) {
      return res.status(403).json({
        error: "Access denied. Only the creator of this location can delete it.",
      });
    }

    const result = await db
      .collection(MONGO_COLLECTION)
      .deleteOne(buildIdQuery(id));

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete location" });
  }
});

// Start server
app.listen(PORT || 8000, () => {
  // Server started
});
