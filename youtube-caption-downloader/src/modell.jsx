/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useRef, useEffect } from 'react';
import Modal from 'react-modal';
import YouTube from 'react-youtube';

const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      backgroundColor: '#111111',
      border: 'none',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };
  

const VideoModal = ({ isOpen, onClose, video }) => {
  // Check if video is null or undefined
  if (!video) {
    return null;
  }

  const { title, videoId, channel, views, description } = video;

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      cc_lang_pref: 'en',
      cc_load_policy: 1,
    },
  };

  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.internalPlayer.cueVideoById(videoId);
    }
  }, [videoId]);

  return (
    <Modal isOpen={isOpen}  style={customStyles} ariaHideApp={false} onRequestClose={onClose}>
      <div className="border-none modal-content">
        <div className="video-container">
          <YouTube videoId={videoId} opts={opts} ref={playerRef} />
        </div>
        <div className="video-details">
          <h2 className='text-xl font-sans font-semibold text-white'>{title}</h2>
          <p className='text-lg font-sans font-normal text-white'>Channel: {channel && channel.name ? channel.name : 'N/A'}</p>
          <p className='text-lg font-sans font-normal text-white'>Views: {views || 'N/A'}</p>
          {/* <p>Description: {description || 'N/A'}</p> */}
        </div>
      </div>
    </Modal>
  );
};

export default VideoModal;
