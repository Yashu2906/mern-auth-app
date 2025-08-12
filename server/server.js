require('dotenv').config(); 
const express = require("express");
const cookieParser = require("cookie-parser");  
const cors = require("cors");
const connectDB = require("./config/mongodb");
const authRouter = require("./routes/auth.route"); 
const userRouter = require('./routes/user.route');

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://mern-auth-app-k8kr.onrender.com",
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("API working");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
