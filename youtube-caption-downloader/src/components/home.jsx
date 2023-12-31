import { useState, useEffect } from "react";
import axios from "axios";
import he from "he";
import Modal from "react-modal"; // Import react-modal
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import VideoModal from "../modell";

function Home() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [loadingVideoId, setLoadingVideoId] = useState(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const openModal = (video) => {
    setSelectedVideo(video);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleDownloadClick = async (videoId) => {
    try {
      setLoadingVideoId(videoId);
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
    } finally {
      setLoadingVideoId(null); // Reset loading state for the specific video
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post("http://localhost:3001/search-videos", {
        query,
      });
      const sortedVideos = response.data.videos.sort(
        (a, b) => b.views - a.views
      ); // Sort by views in descending order
      setVideos(sortedVideos);
    } catch (error) {
      console.error("Error searching videos:", error.message);
    }
  };

  return (
    <>
      <div className="md:min-h-[80vh] min-h-[100vh] space-y-4 py-6 flex flex-col justify-center items-center">
        <div className="text-center py-6">
          <h1 className=" text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl text-center">
            Youtube Video{" "}
            <span className="inline-block  bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Transcript Downloader
            </span>
          </h1>
          <h2 className=" text-base md:w-[60%] w-[80%] mx-auto md:text-xl font-semibold leading-6 text-">
            Youtubechanneltranscripts is a FREE website that allows users to
            download YouTube video transcripts or subtitles in txt format
          </h2>
        </div>
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
                className="w-full  min-h-[300px] md:w-1/3 border-white border-4  hover:shadow-xl hover:scale-[1.02] duration-100 transform flex flex-col justify-center items-center text-center p-4"
              >
                <div
                  className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${video.thumbnail})`,
                  }}
                >
                  <div className="absolute inset-0 bg-[#182f36] opacity-50"></div>
                </div>
                <div className="flex z-10 justify-center items-center h-inherit w-full space-y-4 flex-col">
                  <h2
                    onClick={() => openModal(video)}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Click to play the video and get the details!"
                    className="font-bold cursor-pointer hover:underline text-white font-sans text-xl py-4"
                  >
                    {video.title}
                  </h2>
                  <select
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 py-2 px-2.5 focus:outline-none"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    {/* Add more language options as needed */}
                  </select>
                  {loadingVideoId === video.videoId ? (
                    <div className="bg-indigo-600 text-white p-2 rounded-lg">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#fff"
                      >
                        <path d="M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z">
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            dur="0.6s"
                            values="0 12 12;360 12 12"
                            repeatCount="indefinite"
                          />
                        </path>
                      </svg>
                    </div>
                  ) : (
                    <button
                      className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                      onClick={() => handleDownloadClick(video.videoId)}
                    >
                      Download TXT
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Tooltip id="my-tooltip" />
        </div>

        {/* modal */}
        <VideoModal
          isOpen={modalIsOpen}
          onClose={closeModal}
          video={selectedVideo}
        />
      </div>
    </>
  );
}

export default Home;
