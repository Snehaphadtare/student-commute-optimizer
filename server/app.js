import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log("MongoDB Connected"))
  .catch(err=>console.log(err));

// Schemas
const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, unique: true },
  email: String,
  password: String,
  home: Object,
  dest: Object
}));

// ===== Haversine function =====
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLng = (lng2-lng1) * Math.PI/180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Routes
app.post("/register", async (req,res)=>{
  const { email, password } = req.body;
  const username = "user_" + Math.floor(Math.random()*10000);
  try {
    const user = await User.create({ email, password, username });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/login", async (req,res)=>{
  const user = await User.findOne({ email:req.body.email });
  if(!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// ===== Updated /route endpoint with route matching =====
app.post("/route", async (req,res)=>{
    const { username, home, dest } = req.body;
  
    if (!home || !dest) return res.status(400).json({ error: "Home and Destination required" });
  
    await User.updateOne(
      { username },
      { home, dest }
    );
  
    const allUsers = await User.find({ "home.lat": { $exists: true } });
  
    // Filter nearby students (within 2 km from home)
    const nearby = allUsers.filter(u => {
      if(u.username === username) return false;
      return getDistance(home.lat, home.lng, u.home.lat, u.home.lng) <= 2;
    });
  
    res.json(nearby);
  });
  

// Socket.IO
const serverHttp = http.createServer(app);
const io = new Server(serverHttp, { cors: { origin: "*" } });

io.on("connection", socket => {
  console.log("User connected:", socket.id);
  socket.on("sendMessage", msg => {
    io.emit("receiveMessage", msg);
  });
});

serverHttp.listen(5000, ()=>console.log("Server running on port 5000"));
