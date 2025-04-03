require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const RoadImage = require("./models/RoadImage");
const User = require("./models/User");

const app = express();
connectDB();

// ✅ CORS Configuration
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Middleware for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Uploaded Images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Multer Storage (Saves Images in `uploads/`)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });

// ✅ Upload Image and Store URL in MongoDB
app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            console.log("❌ No file received!");
            return res.status(400).json({ error: "No file uploaded" });
        }

        const imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
        console.log("📤 Storing Image URL:", imageUrl);

        const newImage = new RoadImage({
            imageName: req.file.originalname,
            imageUrl: imageUrl,
            classification: "Pending",
            confidence: 0.0
        });

        await newImage.save();
        console.log("✅ Image URL stored in MongoDB:", newImage);

        res.json({ success: true, message: "Image URL stored in MongoDB", imageUrl });
    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


app.get("/api/images", async (req, res) => {
    try {
        const images = await RoadImage.find({});
        console.log("📂 Retrieved Images from MongoDB:", images); // ✅ Debugging

        if (images.length === 0) {
            console.log("❌ No images found in MongoDB");
            return res.json({ success: true, images: [] });
        }

        res.json({ success: true, images });
    } catch (error) {
        console.error("❌ Error fetching images:", error);
        res.status(500).json({ error: "Failed to fetch images" });
    }
});


// ✅ Send Image to ViT Model for Classification
app.post("/api/vit-classify", async (req, res) => {
    try {
        const { imageUrl } = req.body;
        console.log("📤 Sending image to ViT model:", imageUrl);

        const response = await axios.post("http://127.0.0.1:5001/vit-predict", { imageUrl });

        console.log("✅ ViT Model Response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ ViT Model Error:", error);
        res.status(500).json({ error: "ViT classification failed" });
    }
});

// ✅ User Authentication Routes
app.post("/api/auth/register", async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, email, password, userType } = req.body;
        if (!firstName || !lastName || !phoneNumber || !email || !password || !userType) {
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstName, lastName, phoneNumber, email, password: hashedPassword, userType });
        await newUser.save();

        res.json({ success: true, message: "User registered successfully" });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
        res.json({ success: true, token, userType: user.userType });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
