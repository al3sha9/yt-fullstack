import { useState } from "react";
import axios from "axios";
import he from "he";

function App() {
  const [videoId, setVideoId] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default language is English
  const [videoDetails, setVideoDetails] = useState({
    title: "",
    thumbnail: "",
  });

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleDownloadClick = async () => {
    try {
      // Fetch video details including title and thumbnail
      const responseDetails = await axios.get(
        `http://localhost:3001/video-details?videoId=${videoId}`
      );
      const { title, thumbnail } = responseDetails.data;
  
      
  
      // Update state to reflect the video details
      setVideoDetails({ title, thumbnail });
  
      // Make the download request
      const response = await axios.post(
        `http://localhost:3001/download-caption?lang=${selectedLanguage}`,
        { videoId },
        { responseType: "arraybuffer" } // Use responseType arraybuffer
      );
  
      // Decode the text content using he library
      const decodedText = he.decode(new TextDecoder().decode(new Uint8Array(response.data)));
  
      // Create a Blob object from the decoded text content
      const blob = new Blob([decodedText], { type: "text/plain" });
  
      // Create a link element
      const link = document.createElement("a");
  
      // Set the href attribute with the object URL of the Blob
      link.href = window.URL.createObjectURL(blob);
  
      // Set the download attribute with the video title as the desired file name
      link.download = `${title}.txt`;
  
      // Append the link to the body
      document.body.appendChild(link);
  
      // Trigger a click on the link to start the download
      link.click();
  
      // Remove the link from the body
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading caption:", error.message);
    }
  };
  
  

  const handleResetClick = () => {
    setVideoId("");
    setDownloadLink("");
  };

  return (
    <div className="h-[100vh] space-y-4 flex flex-col justify-center items-center">
      <h1 className="font-extrabold font-sans text-6xl">
        YouTube Caption Downloader
      </h1>
      <input
        type="text"
        className="w-[300px] focus:shadow-2xl focus:outline-none rounded-lg border-gray-900 border p-2  text-sm shadow-sm"
        placeholder="Enter YouTube Video ID"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />
      <div>
        <label htmlFor="languageSelect">Select Language:</label>
        <select
          id="languageSelect"
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          {/* Add more language options as needed */}
        </select>
      </div>
      {videoDetails.title && (
        <div className="bg-indigo-600 hover:z-30   hover:scale-[1.02]  duration-100 transform  flex flex-col justify-center items-center text-center p-4">
          <h2 className="font-bold text-white font-sans text-xl py-4">Video Title: {videoDetails.title}</h2>
          <img src={videoDetails.thumbnail} className=" mx-2 md:mx-0  my-5 px-6  hover:scale-[1.02]  duration-100 transform hover:z-30 hover:shadow-2xl w-[600px] shadow-xl relative" alt="Video Thumbnail" />
        </div>
      )}
      <button
        className=" rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
        onClick={handleDownloadClick}
      >
        Download TXT
      </button>

      {downloadLink && (
        <div>
          <h2>Download Link:</h2>
          <a href={he.decode(downloadLink)} download={`${videoId}_caption.txt`}>
            Download Link
          </a>
          <button onClick={handleResetClick}>Reset</button>
        </div>
      )}
    </div>
  );
}

export default App;
