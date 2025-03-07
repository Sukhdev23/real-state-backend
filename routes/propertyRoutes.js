const express = require("express");
const router = express.Router();
const Property = require("../models/property"); // Assuming you have a Property model for MongoDB
const multer = require("multer");

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Delete a property
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProperty = await Property.findByIdAndDelete(id);
    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted successfully", deletedProperty });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update a property
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updatedProperty = await Property.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property updated successfully", updatedProperty });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// GET: Fetch all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to fetch properties." });
  }
});


// POST: Upload property
router.post("/uploads", upload.array("images"), async (req, res) => {
  try {
    const { projectId, title, area, price, description, location , type} = req.body;
    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    // Create a new property entry
    const newProperty = new Property({
      projectId,
      title,
      area,
      price,
      description,
      location,
      type,
      images: imagePaths, // Store Base64 strings in MongoDB
    });

    await newProperty.save();
    res.status(201).json({ message: "Property uploaded successfully!", property: newProperty });
  } catch (error) {
    console.error("Error uploading property:", error);
    res.status(500).json({ message: "Failed to upload property." });
  }
});

// Example: Express.js API endpoint
router.get("/api/properties", async (req, res) => {
  const { query, type, budget } = req.query;

  // Construct filter object based on query parameters
  const filters = {};
  if (query) {
    filters.title = { $regex: query, $options: "i" }; // Case-insensitive match for title
  }
  if (type) {
    filters.type = type;
  }
  if (budget) {
    const budgetRange = getBudgetRange(budget); // Define a function to map budget to min/max values
    if (budgetRange) {
      filters.price = { $gte: budgetRange.min, $lte: budgetRange.max };
    }
  }

  try {
    const properties = await Property.find(filters); // Assuming `Property` is your MongoDB model
    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).send("Error fetching properties");
  }
});




module.exports = router;
