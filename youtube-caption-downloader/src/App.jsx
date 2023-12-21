import { useState, useEffect } from "react";
import axios from "axios";
import he from "he";

function App() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [videoDetails, setVideoDetails] = useState({
    title: "",
    thumbnail: "",
  });

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleDownloadClick = async (videoId) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/download-caption?lang=${selectedLanguage}`,
        { videoId },
        { responseType: "arraybuffer" }
      );

      const decodedText = he.decode(
        new TextDecoder().decode(new Uint8Array(response.data))
      );

      const blob = new Blob([decodedText], { type: "text/plain" });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${
        videos.find((video) => video.videoId === videoId).title
      }.txt`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading caption:", error.message);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post("http://localhost:3001/search-videos", {
        query,
      });
      setVideos(response.data.videos);
    } catch (error) {
      console.error("Error searching videos:", error.message);
    }
  };

  return (
    <div className="min-h-[100vh] space-y-4 py-6 flex flex-col justify-center items-center">
      <h1 className="font-extrabold font-sans text-6xl">
        YouTube Caption Downloader
      </h1>
      <div className="flex flex-wrap md:flex-nowrap mx-2 md:mx-0">
        <input
          type="text"
          className="w-full w-full tracking-wide h-12 px-4 mb-3 text-black transition duration-200 border-2 border-indigo-600 appearance-none focus:outline-none focus:shadow-outline"
          placeholder="Enter Video URL or Video Title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className=" inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide bg-indigo-600 border-indigo-600 border-2 md:border-l-0 hover:bg-transparent hover:text-indigo-600 text-white transition duration-200 shadow-md md:w-auto focus:shadow-outline focus:outline-none"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-2xl md:px-24 lg:px-8 lg:py-10">
        <div className="flex flex-col md:flex-row flex-wrap">
          {videos.map((video) => (
            <div
              key={video.videoId}
              className="bg-indigo-300 w-full md:w-1/3 border-white border-4 hover:z-30 hover:shadow-xl   hover:scale-[1.02]  duration-100 transform  flex flex-col justify-center items-center text-center p-4"
            >
              <h2 className="font-bold text-white font-sans text-xl py-4">
                {video.title}
              </h2>
              <img
                src={video.thumbnail}
                className="mx-2 md:mx-0  my-5 px-6  hover:scale-[1.02]  duration-100 transform hover:z-30 hover:shadow-2xl  shadow-xl relative"
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
    </div>
  );
}

export default App;
