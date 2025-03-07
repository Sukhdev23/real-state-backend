const express = require("express");
const router = express.Router();
const Property = require("../models/property");
const multer = require("multer");
const fs = require("fs");

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

// Delete a property (and remove images)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProperty = await Property.findByIdAndDelete(id);
    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Delete images from server
    deletedProperty.images.forEach((imagePath) => {
      const localPath = `.${imagePath}`;
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    });

    res.status(200).json({ message: "Property deleted successfully" });
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

// Fetch all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties." });
  }
});

// Upload property with images
router.post("/upload-property", upload.array("images"), async (req, res) => {
  try {
    const { projectId, title, area, price, description, location, type } = req.body;
    const imagePaths = req.files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);

    const newProperty = new Property({
      projectId,
      title,
      area,
      price,
      description,
      location,
      type,
      images: imagePaths,
    });

    await newProperty.save();
    res.status(201).json({ message: "Property uploaded successfully!", property: newProperty });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload property." });
  }
});

// Filter properties
router.get("/filter", async (req, res) => {
  const { query, type, budget } = req.query;
  const filters = {};

  if (query) filters.title = { $regex: query, $options: "i" };
  if (type) filters.type = type;
  if (budget) {
    const budgetRange = getBudgetRange(budget);
    if (budgetRange) filters.price = { $gte: budgetRange.min, $lte: budgetRange.max };
  }

  try {
    const properties = await Property.find(filters);
    res.json(properties);
  } catch (error) {
    res.status(500).send("Error fetching properties");
  }
});

// Function to map budget to min/max values
function getBudgetRange(budget) {
  const ranges = {
    low: { min: 0, max: 500000 },
    medium: { min: 500000, max: 2000000 },
    high: { min: 2000000, max: 10000000 },
  };
  return ranges[budget] || null;
}

module.exports = router;
