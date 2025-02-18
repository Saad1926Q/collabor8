const express = require("express");
const cors = require("cors");
require("dotenv").config();

const gitRoutes = require("./routes/gitRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/git", gitRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

