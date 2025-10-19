"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [inputText, setInputText] = useState(""); // New state for the text input
  const [extractedText, setExtractedText] = useState(""); // Renamed for clarity
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    // 1. Validation: Ensure at least a file OR text is provided
    if (!file && !inputText.trim()) {
      alert("Please choose a PDF file or enter some text!");
      return;
    }

    setLoading(true);
    setExtractedText(""); // Clear previous result

    const formData = new FormData();
    
    // Append the file if one is selected
    if (file) {
      formData.append("file", file);
    }
    
    // Append the text input (even if it's empty, the backend can handle it)
    console.log("Input Text:", inputText);
    formData.append("text", inputText); 

    try {
      // NOTE: Ensure your Python backend is configured to accept POST requests 
      // and handle both 'file' and 'inputText' fields.
      console.log("Sending request to backend...");
  
      const res = await fetch("http://127.0.0.1:5000/generate-comic", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      console.log("Response from backend:", res);
      const data = await res.json();
      console.log("Data received:", data);
      
      // Assuming your backend returns a field like 'extracted_data'
      setExtractedText(data.extracted_data || "No data received from server.");
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Error processing request. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">
          📄 Input Options Demo
        </h1>

        {/* PDF Upload Section */}
        <div className="mb-6 p-4 border rounded-lg bg-indigo-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
          />
        </div>

        {/* OR Separator */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 font-semibold">
            OR
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Text Input Section */}
        <div className="mb-6 p-4 border rounded-lg bg-lime-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder="Type your text here..."
            className="w-full border p-3 rounded-md focus:ring-lime-500 focus:border-lime-500 transition duration-150 ease-in-out"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || (!file && !inputText.trim())}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-blue-700 disabled:opacity-50 transition duration-150"
        >
          {loading ? "Processing..." : "Process Data"}
        </button>

        <h2 className="mt-8 font-semibold text-gray-800">Result:</h2>
        <pre className="bg-gray-100 mt-2 p-4 rounded-md text-sm whitespace-pre-wrap max-h-80 overflow-y-auto border border-gray-200">
          {extractedText || (loading ? "Awaiting response..." : "Upload a file or enter text to see the result.")}
        </pre>
      </div>
    </main>
  );
}