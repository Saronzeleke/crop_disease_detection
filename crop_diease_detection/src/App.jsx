import React, { useState, useEffect } from "react";
import axios from "axios";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import Confetti from "react-confetti";
import "./App.css"; // Import the CSS file
import { lightTheme, darkTheme } from "./Theme";

const App = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [uploadCount, setUploadCount] = useState(0);

  const farmingTips = [
    "Did you know? Rotating crops can help prevent soil-borne diseases.",
    "Tip: Regularly inspect your plants for early signs of disease.",
    "Fun Fact: Some plants release chemicals to repel pests naturally!",
  ];

  const randomTip = farmingTips[Math.floor(Math.random() * farmingTips.length)];

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds the 5MB limit.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setPrediction(null);
      setError(null);
      setUploadCount((prev) => prev + 1);
    }
  };

  const handleCrop = (cropper) => {
    if (cropper) {
      setCroppedImage(cropper.getCroppedCanvas().toDataURL());
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPrediction(response.data);
    } catch (err) {
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setCroppedImage(null);
    setPrediction(null);
    setError(null);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
  };

  // Apply theme variables to the root element
  useEffect(() => {
    const root = document.documentElement;
    const theme = darkMode ? darkTheme : lightTheme;
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--cardBackground", theme.cardBackground);
    root.style.setProperty("--buttonBackground", theme.buttonBackground);
    root.style.setProperty("--buttonHover", theme.buttonHover);
  }, [darkMode]);

  return (
    <div className="container">
      <nav className="navbar">
        <button className="toggle-button" onClick={toggleDarkMode}>
          {darkMode ? "🌞" : "🌙"}
        </button>
      </nav>
      <div className="content">
        <h1 className="title">Crop Disease Detection</h1>
        <div className="tip-container">
          <p className="tip-text">{randomTip}</p>
        </div>
        <div className="upload-container">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          {preview && (
            <Cropper
              src={preview}
              style={{ height: 300, width: "100%" }}
              aspectRatio={1}
              guides={false}
              crop={handleCrop}
            />
          )}
          {croppedImage && (
            <img
              src={croppedImage}
              alt="Cropped"
              className="cropped-image"
              style={{ marginTop: "20px", maxWidth: "100%" }}
            />
          )}
          <button className="button" onClick={handleSubmit} disabled={loading}>
            {loading ? <div className="spinner" /> : "Predict Disease"}
          </button>
          {file && (
            <button className="remove-button" onClick={handleRemoveImage}>
              Remove Image
            </button>
          )}
        </div>

        {prediction && (
          <>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
            />
            <div className="result-container fade-in">
              <h2 className="result-title">Prediction Result</h2>
              <p className="result-text">
                <strong>Disease:</strong> {prediction.predicted_disease}
              </p>
              <p className="result-text">
                <strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(2)}%
              </p>
              <p className="result-text">
                <strong>Treatment:</strong> {prediction.treatment}
              </p>
              <p className="description">
                {prediction.description || "No additional information available."}
              </p>
            </div>
          </>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="progress-container">
          <p>You've analyzed {uploadCount} images so far. Keep it up!</p>
        </div>
      </div>
    </div>
  );
};

export default App;