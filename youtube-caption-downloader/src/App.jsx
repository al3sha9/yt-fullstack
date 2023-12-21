import { useState, useEffect } from 'react';
import axios from 'axios';
import he from 'he';

function App() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [videoDetails, setVideoDetails] = useState({
    title: '',
    thumbnail: '',
  });

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleDownloadClick = async (videoId) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/download-caption?lang=${selectedLanguage}`,
        { videoId },
        { responseType: 'arraybuffer' }
      );

      const decodedText = he.decode(new TextDecoder().decode(new Uint8Array(response.data)));

      const blob = new Blob([decodedText], { type: 'text/plain' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${videos.find(video => video.videoId === videoId).title}.txt`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading caption:', error.message);
    }
  };

  const handleResetClick = () => {
    setQuery('');
    setVideos([]);
    setVideoDetails({ title: '', thumbnail: '' });
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:3001/search-videos', { query });
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Error searching videos:', error.message);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [query]);

  return (
    <div className=" space-y-4 flex flex-col justify-center items-center">
      <h1 className="font-extrabold font-sans text-6xl">
        YouTube Caption Downloader
      </h1>
      <input
        type="text"
        className="w-[300px] focus:shadow-2xl focus:outline-none rounded-lg border-gray-900 border p-2  text-sm shadow-sm"
        placeholder="Enter YouTube Video URL or Text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
        onClick={handleSearch}
      >
        Search
      </button>
      <div className='px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-2xl md:px-24 lg:px-8 lg:py-10'>
      <div className='flex flex-row flex-wrap'>
      {videos.map((video) => (
        <div key={video.videoId} className="bg-indigo-300 w-1/2 border-black border hover:z-30 hover:shadow-xl   hover:scale-[1.02]  duration-100 transform  flex flex-col justify-center items-center text-center p-4">
          <h2 className="font-bold text-white font-sans text-xl py-4">
            Video Title: {video.title}
          </h2>
          <img
            src={video.thumbnail}
            className="mx-2 md:mx-0  my-5 px-6  hover:scale-[1.02]  duration-100 transform hover:z-30 hover:shadow-2xl w-[600px] shadow-xl relative"
            alt="Video Thumbnail"
          />
          <button
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
            onClick={() => handleDownloadClick(video.videoId)}
          >
            Download TXT
          </button>
        </div>
      ))}
      </div>
      </div>
      {/* {videoDetails.title && (
        <div className="bg-indigo-600 hover:z-30   hover:scale-[1.02]  duration-100 transform  flex flex-col justify-center items-center text-center p-4">
          <h2 className="font-bold text-black font-sans text-xl py-4">
            Video Title: {videoDetails.title}
          </h2>
          <img
            src={videoDetails.thumbnail}
            className="mx-2 md:mx-0  my-5 px-6  hover:scale-[1.02]  duration-100 transform hover:z-30 hover:shadow-2xl w-[600px] shadow-xl relative"
            alt="Video Thumbnail"
          />
        </div>
      )} */}
      {/* <button
        className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
        onClick={handleResetClick}
      >
        Reset
      </button> */}
    </div>
  );
}

export default App;
