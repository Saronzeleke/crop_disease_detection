import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button as TailwindButton } from '@/components/ui/button';
import { Upload, Moon, Sun } from 'lucide-react';
import axios from 'axios';  // Import Axios
import { motion } from 'framer-motion';

const App = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);  // State to store prediction result

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handlePredict = async () => {
    if (!file) {
      setError('Please upload an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send a POST request to the Flask backend
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.predicted_disease) {
        setPrediction(response.data);  // Store prediction result in state
        setError(null);  // Clear any previous errors
      } else {
        setError(response.data.error || 'An unexpected error occurred');
      }
    } catch (error) {
      setError('An error occurred during prediction.');
    }
  };

  return (
    <div className={`p-6 flex flex-col items-center space-y-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between w-full max-w-md">
        <h1 className="text-2xl font-bold">Crop Disease Detection</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2">
          {darkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-gray-500" />}
        </button>
      </div>

      <Card className="w-full max-w-md p-4 space-y-4">
        <CardContent className="flex flex-col items-center">
          {preview ? (
            <img src={preview} alt="Uploaded" className="w-full rounded-xl mb-4" />
          ) : (
            <div className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center">
              <Upload size={48} className="text-gray-500 mb-4" />
              <p className="text-gray-500">Upload an image of your crop</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="upload-input"
          />
          <label htmlFor="upload-input">
            <TailwindButton variant="outline">Choose Image</TailwindButton>
          </label>
          <TailwindButton variant="default" className="mt-4" onClick={handlePredict}>
            Predict Disease
          </TailwindButton>
        </CardContent>
      </Card>

      {error && <p className="text-red-500">{error}</p>}

      {prediction && (
        <div className="mt-4 text-center">
          <h3 className="font-bold text-lg">Prediction Results:</h3>
          <p>Predicted Disease: {prediction.predicted_disease}</p>
          <p>Confidence: {prediction.confidence}</p>
          <p>Treatment: {prediction.treatment}</p>
        </div>
      )}
    </div>
  );
};

export default App;
