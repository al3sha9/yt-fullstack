// Bulk.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function DownloadBulk(){
  const [channelName, setChannelName] = useState('');
  const [channelDetails, setChannelDetails] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`/channel-details?channelName=${channelName}`);
      const { name, totalVideos, profilePic } = response.data;
      setChannelDetails({ name, totalVideos, profilePic });
      setError(null);
    } catch (error) {
      console.error('Error fetching channel details:', error);
      setChannelDetails(null);
      setError('Error fetching channel details. Please try again.');
    }
  };

  return (
    <div>
      <h1>Download Bulk</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Channel Name:
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
        </label>
        <button type="submit">Get Channel Details</button>
      </form>

      {channelDetails && (
        <div>
          <h2>Channel Details</h2>
          <p>Name: {channelDetails.name}</p>
          <p>Total Videos: {channelDetails.totalVideos}</p>
          <img src={channelDetails.profilePic} alt="Channel Profile" />
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}