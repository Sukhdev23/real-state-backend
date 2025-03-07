require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/propertyRoutes.js');
const cors = require('cors');

const app = express();
connectDB();

// ✅ Fix: Proper CORS Configuration
app.use(cors({
  origin: ["https://peachpuff-oryx-197319.hostingersite.com", "http://localhost:8080"], // Add your frontend domains
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Property router
app.use("/api/properties", propertyRoutes);

// User router
app.use('/user', authRoutes);

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
