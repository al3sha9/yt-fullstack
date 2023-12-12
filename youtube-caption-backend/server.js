const express = require('express');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/download-caption', async (req, res) => {
  const { videoId } = req.body;
  const lang = 'en';
  const format = 'xml';

  try {
    const info = await ytdl.getInfo(videoId);
    const tracks = info.player_response.captions.playerCaptionsTracklistRenderer.captionTracks;

    if (tracks && tracks.length) {
      const track = tracks.find(t => t.languageCode === lang);

      if (track) {
        const output = `${info.videoDetails.title}.${track.languageCode}.${format}`;
        const captionLink = `${track.baseUrl}&fmt=${format !== 'xml' ? format : ''}`;

        https.get(captionLink, (response) => {
          response.pipe(fs.createWriteStream(path.resolve(__dirname, output)));
        });

        res.json({ captionLink });
      } else {
        res.status(404).json({ error: 'Could not find captions for the specified language' });
      }
    } else {
      res.status(404).json({ error: 'No captions found for this video' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
