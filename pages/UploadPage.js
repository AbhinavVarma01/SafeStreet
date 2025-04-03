import React, { useState } from "react";
import "./UploadPage.css";

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleUpload = async () => {
    if (!image) {
        alert("Please select an image first!");
        return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);
    setResult(null);

    try {
        const response = await fetch("http://localhost:5001/predict", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("🟢 Response from Flask /predict:", data); // ✅ Debugging

        setLoading(false);

        if (data.error) {
            setResult({ error: "Prediction failed. Try again." });
        } else {
            setResult(data);
        }
    } catch (error) {
        console.error("Upload error:", error);
        setLoading(false);
        setResult({ error: "Failed to connect to the server" });
    }
};

const handleProceed = async () => {
  console.log("🚀 handleProceed() function called!");

  if (!result || !result.class || !result.filename) {
      console.log("❌ Missing result data:", result);
      alert("Image classification missing. Try uploading again.");
      return;
  }

  const imageUrl = `http://localhost:5001/uploads/${result.filename}`; // ✅ Fix URL

  const dbEntry = {
      imageName: result.filename,  
      imageUrl,
      classification: result.class,
      confidence: result.confidence,
  };

  console.log("📤 Sending Data to /api/store:", JSON.stringify(dbEntry, null, 2));

  try {
      const response = await fetch("http://localhost:5001/api/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dbEntry),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("✅ Response received from /api/store:", responseData);

      if (responseData.success) {
          alert("Image data successfully stored in MongoDB.");
      } else {
          alert("Failed to store image data in MongoDB.");
      }
  } catch (error) {
      console.error("❌ Database upload error:", error);
      alert("Error storing image data in database.");
  }
};

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h2>Upload a Road Image</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && <img src={preview} alt="Preview" className="image-preview" />}
        <button onClick={handleUpload} disabled={loading} className="upload-btn">
          {loading ? "Processing..." : "Upload & Predict"}
        </button>
        {result && (
          <div className="result-box">
            {result.error ? (
              <p className="error-text">❌ {result.error}</p>
            ) : (
              <>
                <h3>Prediction: {result.class}</h3>
                <p>Confidence: <strong>{Math.round((result.confidence || 0) * 100)}%</strong></p>
                {result.class.toLowerCase() === "road" ? (
                  <button onClick={handleProceed} className="upload-btn">Proceed</button>
                ) : (
                  <p className="error-text">❌ Image not classified as road. Please upload again.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;