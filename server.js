// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/propertyRoutes.js')
const cors = require('cors');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
// Serve the "uploads" folder as static
app.use("/uploads", express.static("uploads"));
// property router
app.use("/api/properties", propertyRoutes);
// user router
app.use('/user', authRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

