import React, { useState, useEffect } from "react";
import "./Authority.css"; // Import CSS file

const Authority = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch only images classified as "Road" from MongoDB
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/images");
        const data = await response.json();
        if (data.success) {
          // ✅ Filter only images classified as "Road"
          const roadImages = data.images.filter(img => img.classification.toLowerCase() === "road");
          setImages(roadImages);
        }
      } catch (error) {
        console.error("❌ Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // ✅ Handle sending image to ViT model
  const handleProceed = async () => {
    if (images.length === 0) return;

    const selectedImage = images[currentIndex];
    console.log("🚀 Sending to ViT:", selectedImage);

    try {
      const response = await fetch("http://localhost:5001/api/vit-classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: selectedImage.imageUrl })
      });

      const result = await response.json();
      console.log("✅ ViT Classification Result:", result);

      alert(`ViT Classification: ${result.classification} (Confidence: ${(result.confidence * 100).toFixed(2)}%)`);

      // ✅ Move to the next image
      if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        alert("✅ All images reviewed!");
      }
    } catch (error) {
      console.error("❌ Error sending image to ViT:", error);
      alert("Failed to classify image. Try again.");
    }
  };

  return (
    <div className="authority-container">
      <h2 className="authority-title">Authority Dashboard</h2>
      {loading ? (
        <p className="loading-text">Loading images...</p>
      ) : images.length > 0 ? (
        <div className="image-box">
          <img
            src={images[currentIndex].imageUrl}
            alt={images[currentIndex].imageName}
            className="image-preview"
          />
          <p className="image-info">
            <strong>Classification:</strong> {images[currentIndex].classification}
          </p>
          <p className="image-info">
            <strong>Confidence:</strong> {(images[currentIndex].confidence * 100).toFixed(2)}%
          </p>
          <button onClick={handleProceed} className="proceed-button">
            Proceed
          </button>
        </div>
      ) : (
        <p className="loading-text">No road images found...</p>
      )}
    </div>
  );
};

export default Authority;
