const mongoose = require("mongoose");

const RoadImageSchema = new mongoose.Schema({
    imageName: { type: String, required: true },
    imageUrl: { type: String, required: true }, // ✅ Store only the URL
    classification: { type: String, required: true },
    confidence: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RoadImage", RoadImageSchema);
