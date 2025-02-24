import React, { useState, useEffect } from "react";
import axios from "axios";
import styled, { keyframes, ThemeProvider } from "styled-components";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";

const lightTheme = {
  background: "#f5f7fa",
  text: "#2c3e50",
  cardBackground: "#fff",
  buttonBackground: "#3498db",
  buttonHover: "#2980b9",
};

const darkTheme = {
  background: "#2c3e50",
  text: "#f5f7fa",
  cardBackground: "#34495e",
  buttonBackground: "#2980b9",
  buttonHover: "#3498db",
};

const App = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds the 5MB limit.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setPrediction(null);
      setError(null);
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
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode); // Save preference to localStorage
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Container>
        <Navbar>
          <ToggleButton onClick={toggleDarkMode}>
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </ToggleButton>
        </Navbar>
        <Content>
          <Title>Crop Disease Detection</Title>
          <UploadContainer>
            <FileInput type="file" accept="image/*" onChange={handleFileChange} />
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
              <img src={croppedImage} alt="Cropped" style={{ marginTop: "20px", maxWidth: "100%" }} />
            )}
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner /> : "Predict Disease"}
            </Button>
            {file && (
              <RemoveButton onClick={handleRemoveImage}>
                Remove Image
              </RemoveButton>
            )}
          </UploadContainer>

          {prediction && (
            <ResultContainer>
              <ResultTitle>Prediction Result</ResultTitle>
              <ResultText>
                <strong>Disease:</strong> {prediction.predicted_disease}
              </ResultText>
              <ResultText>
                <strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(2)}%
              </ResultText>
              <ResultText>
                <strong>Treatment:</strong> {prediction.treatment}
              </ResultText>
            </ResultContainer>
          )}

          {error && <ErrorText>{error}</ErrorText>}
        </Content>
      </Container>
    </ThemeProvider>
  );
};

export default App;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: flex-start;
  padding: 20px;
  background: ${({ theme }) => theme.cardBackground};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-align: center;
`;

const ToggleButton = styled.button`
  padding: 10px 20px;
  background: ${({ theme }) => theme.buttonBackground};
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.buttonHover};
  }
`;

const UploadContainer = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 500px;
`;

const FileInput = styled.input`
  margin: 20px 0;
  padding: 10px;
  border: 2px dashed #3498db;
  border-radius: 10px;
  width: 100%;
  cursor: pointer;
  &:hover {
    border-color: #2980b9;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme.buttonBackground};
  color: #fff;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
  &:hover {
    background: ${({ theme }) => theme.buttonHover};
  }
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  padding: 8px 16px;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background: #c0392b;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: ${spin} 1s linear infinite;
`;

const ResultContainer = styled.div`
  margin-top: 20px;
  background: ${({ theme }) => theme.cardBackground};
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 500px;
`;

const ResultTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const ResultText = styled.p`
  margin: 5px 0;
  font-size: 1.1rem;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  margin-top: 20px;
  font-size: 1rem;
`;
