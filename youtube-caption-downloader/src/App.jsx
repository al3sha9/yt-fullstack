import { useState } from 'react';
import axios from 'axios';

function App() {
  const [videoId, setVideoId] = useState('');
  const [captionLink, setCaptionLink] = useState('');

  const handleDownloadClick = async () => {
    try {
      const response = await axios.post('http://localhost:3001/download-caption', { videoId });
      setCaptionLink(response.data.captionLink);
    } catch (error) {
      console.error('Error downloading caption:', error.message);
    }
  };

  return (
    <div>
      <h1>YouTube Caption Downloader</h1>
      <input
        type="text"
        placeholder="Enter YouTube Video ID"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />
      <button onClick={handleDownloadClick}>Download Caption</button>

      {captionLink && (
        <div>
          <h2>Downloaded Caption:</h2>
          <a href={captionLink} target="_blank" rel="noopener noreferrer">
            Download Link
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
