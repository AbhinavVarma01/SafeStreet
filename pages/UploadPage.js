import React, { useState, useEffect } from 'react';
import { Upload, History, User, LogOut } from 'lucide-react';
import './UploadPage.css';

function UploadPage() {
  const userEmail = localStorage.getItem("email");
  const [activeTab, setActiveTab] = useState('upload');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>SafeStreet</h2>
        </div>
        <div className="nav-links">
          <button className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            <Upload size={20} /><span>Upload</span>
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={20} /><span>History</span>
          </button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={20} /><span>Profile</span>
          </button>
        </div>
        <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-dialog">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="logout-confirm-buttons">
              <button className="logout-confirm-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="logout-confirm-proceed" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Welcome, {userEmail || "Guest"}!</h1>
        </header>

        {activeTab === 'upload' && <UploadComponent userEmail={userEmail} />}
        {activeTab === 'history' && <PreviousUploads userEmail={userEmail} />}
        {activeTab === 'profile' && <UserProfile userEmail={userEmail} />}
      </main>
    </div>
  );
}

// Upload Component
function UploadComponent({ userEmail }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload only JPEG, JPG, or PNG images');
        setImage(null);
        setPreview('');
        return;
      }
      setError('');
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setShowResult(false);
    }
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image first!");

    setLoading(true);
    setResult(null);
    setShowResult(false);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5001/predict", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
      // Add a small delay to show the loading state
      setTimeout(() => {
        setShowResult(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setResult({ error: "Failed to connect to the server" });
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    if (!result?.filename) return;

    const imageUrl = `http://localhost:5001/uploads/${result.filename}`;
    const dbEntry = {
      imageName: result.filename,
      imageUrl,
      classification: result.class,
      confidence: result.confidence,
      userEmail
    };

    try {
      const response = await fetch("http://localhost:5001/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbEntry),
      });

      const data = await response.json();
      if (data.success) {
        alert("Image successfully stored!");
        setImage(null);
        setPreview('');
        setResult(null);
        setShowResult(false);
      }
    } catch (error) {
      console.error("Database error:", error);
      alert("Failed to store image data");
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h2>Upload Road Image</h2>
        <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
          {preview ? (
            <img src={preview} alt="Preview" className="image-preview" />
          ) : (
            <div className="upload-placeholder">
              <Upload size={48} />
              <p>Click to select or drag an image here</p>
              <p className="file-types">(JPEG, JPG, PNG only)</p>
            </div>
          )}
          <input 
            id="fileInput" 
            type="file" 
            accept=".jpg,.jpeg,.png" 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
          />
        </div>
        {error && <p className="error-message">{error}</p>}

        <button className={`upload-button ${loading ? 'loading' : ''}`} onClick={handleUpload} disabled={!image || loading}>
          {loading ? <div className="spinner"></div> : 'Analyze Image'}
        </button>

        {result && showResult && (
          <div className={`result-box ${result.class?.toLowerCase() === 'road' ? 'success' : 'error'} ${showResult ? 'show' : ''}`}>
            <h3>Analysis Result</h3>
            {result.error ? (
              <p className="error-message">{result.error}</p>
            ) : (
              <>
                <div className="result-content">
                  <div className="classification-badge">
                    <span className="badge-text">{result.class}</span>
                    <div className="confidence-indicator">
                      <div 
                        className="confidence-circle" 
                        style={{ 
                          '--target-width': `${result.confidence * 100}%`
                        }}
                      >
                        <div className="confidence-inner">
                          <span>{Math.round(result.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {result.class?.toLowerCase() === 'road' ? (
                  <button className="proceed-button" onClick={handleProceed}>
                    Save Result
                  </button>
                ) : (
                  <p className="error-message">Please upload a road image</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Previous Uploads Component
function PreviousUploads({ userEmail }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/uploads?email=${userEmail}`);
        const data = await response.json();
        
        if (data.success) {
          // Sort uploads by date (newest first)
          const sortedUploads = data.uploads.sort((a, b) => 
            new Date(b.uploadedAt) - new Date(a.uploadedAt)
          );
          setUploads(sortedUploads);
        } else {
          setError(data.error || "Failed to fetch uploads");
        }
      } catch (error) {
        console.error('Failed to fetch uploads:', error);
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your upload history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Uploads Yet</h3>
        <p>You haven't uploaded any images yet. Start by uploading your first road image!</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>Your Upload History</h2>
      <div className="uploads-grid">
        {uploads.map((upload, index) => (
          <div key={index} className="upload-card">
            <div className="image-container">
              <img src={upload.imageUrl} alt={upload.imageName} />
            </div>
            <div className="upload-info">
              <h3>{upload.classification}</h3>
              <div className="confidence-bar">
                <div className="confidence-level" style={{ width: `${upload.confidence * 100}%` }}></div>
                <span>{Math.round(upload.confidence * 100)}% Confidence</span>
              </div>
              <div className="upload-details">
                <p className="upload-date">
                  <strong>Uploaded:</strong> {new Date(upload.uploadedAt).toLocaleString()}
                </p>
                <p className="image-name">
                  <strong>Filename:</strong> {upload.imageName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile Component
function UserProfile({ userEmail }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user profile data
        const userResponse = await fetch(`http://localhost:5001/api/user?email=${userEmail}`);
        const userData = await userResponse.json();

        // Fetch user's uploads
        const uploadsResponse = await fetch(`http://localhost:5001/api/uploads?email=${userEmail}`);
        const uploadsData = await uploadsResponse.json();

        if (userData.success && uploadsData.success) {
          setProfileData({
            ...userData.user,
            totalUploads: uploadsData.uploads.length,
            recentUploads: uploadsData.uploads.slice(0, 5), // Show last 5 uploads
            uploadStats: {
              roadImages: uploadsData.uploads.filter(u => u.classification === 'Road').length,
              nonRoadImages: uploadsData.uploads.filter(u => u.classification === 'Not Road').length,
              averageConfidence: uploadsData.uploads.reduce((acc, curr) => acc + curr.confidence, 0) / uploadsData.uploads.length || 0
            }
          });
        } else {
          setError("Failed to fetch profile data");
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="empty-state">
        <h3>Profile Not Found</h3>
        <p>Unable to load profile data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="profile-header">
        <h2>User Profile</h2>
        <div className="profile-stats">
          <div className="stat-card">
            <h3>Total Uploads</h3>
            <p>{profileData.totalUploads}</p>
          </div>
          <div className="stat-card">
            <h3>Road Images</h3>
            <p>{profileData.uploadStats.roadImages}</p>
          </div>
          <div className="stat-card">
            <h3>Average Confidence</h3>
            <p>{Math.round(profileData.uploadStats.averageConfidence * 100)}%</p>
          </div>
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-group">
          <h3>Account Information</h3>
          <div className="detail-item">
            <span className="label">First Name:</span>
            <span className="value">{profileData.firstName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Last Name:</span>
            <span className="value">{profileData.lastName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Email:</span>
            <span className="value">{profileData.email}</span>
          </div>
          <div className="detail-item">
            <span className="label">Phone:</span>
            <span className="value">{profileData.phone}</span>
          </div>
          <div className="detail-item">
            <span className="label">User Type:</span>
            <span className="value">{profileData.userType}</span>
          </div>
          <div className="detail-item">
            <span className="label">Member Since:</span>
            <span className="value">{new Date(profileData.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="detail-group">
          <h3>Recent Uploads</h3>
          {profileData.recentUploads.length > 0 ? (
            <div className="recent-uploads">
              {profileData.recentUploads.map((upload, index) => (
                <div key={index} className="recent-upload-item">
                  <img src={upload.imageUrl} alt={upload.imageName} />
                  <div className="upload-info">
                    <p className="classification">{upload.classification}</p>
                    <p className="confidence">{Math.round(upload.confidence * 100)}%</p>
                    <p className="date">{new Date(upload.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-uploads">No recent uploads</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
