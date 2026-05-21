const authRoutes= require('./routes/auth.routes');
const todoRoutes = require('./routes/todo.routes');
const express = require('express'); 
const cors = require('cors'); 
const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.use("/api/auth", authRoutes);
app.use(todoRoutes);

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

