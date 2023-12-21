const express = require('express');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const https = require('https');
const xml2js = require('xml2js');
const ytSearch = require('yt-search');

const app = express();
const PORT = process.env.PORT || 3001;
const lang = process.env.DEFAULT_LANGUAGE || 'en';

app.use(express.json());

// Function to handle errors and return a consistent JSON response
const handleErrors = (res, error, status = 500) => {
  console.error('Error:', error);
  res.status(status).json({ error: 'Internal Server Error' });
};

app.post('/search-videos', async (req, res) => {
  const { query } = req.body;

  try {
    const searchResults = await ytSearch(query);
    const videos = searchResults.videos.slice(0, 12).map(video => ({
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      views: video.views || 'N/A', // Include views with a fallback
      channel: {
        name: video.author.name || 'N/A', // Include channel name with a fallback
      },
      description: video.description || 'No description available',
    }));
    res.json({ videos });
  } catch (error) {
    handleErrors(res, error);
  }
});

app.post('/download-caption', async (req, res) => {
  const { videoId } = req.body;
  const format = 'xml';
  const clientLang = req.query.lang;

  try {
    const info = await ytdl.getInfo(videoId);
    const tracks = info.player_response.captions.playerCaptionsTracklistRenderer.captionTracks;

    if (tracks && tracks.length) {
      const track = tracks.find(t => t.languageCode === (clientLang || lang));

      if (track) {
        const captionLink = `${track.baseUrl}&fmt=${format !== 'xml' ? format : ''}`;

        https.get(captionLink, async (response) => {
          let xmlData = '';

          response.on('data', (chunk) => {
            xmlData += chunk;
          });

          response.on('end', async () => {
            const parser = new xml2js.Parser();
            parser.parseString(xmlData, async (err, result) => {
              if (err) {
                handleErrors(res, err);
              } else {
                const textContent = result.transcript.text.map(textElement => textElement._);
                const processedText = textContent.join(' ');

                const outputFileName = `${info.videoDetails.title}_${lang}.txt`;
                const outputPath = path.resolve(__dirname, outputFileName);

                fs.writeFile(outputPath, processedText, (writeErr) => {
                  if (writeErr) {
                    handleErrors(res, writeErr);
                  } else {
                    res.download(outputPath, outputFileName, (downloadErr) => {
                      if (downloadErr) {
                        handleErrors(res, downloadErr);
                      } else {
                        fs.unlink(outputPath, (unlinkErr) => {
                          if (unlinkErr) {
                            console.error('Error deleting file:', unlinkErr);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          });
        });
      } else {
        res.status(404).json({ error: 'Could not find captions for the specified language' });
      }
    } else {
      res.status(404).json({ error: 'No captions found for this video' });
    }
  } catch (error) {
    handleErrors(res, error);
  }
});

app.get('/video-details', async (req, res) => {
  const { videoId } = req.query;

  try {
    const info = await ytdl.getInfo(videoId);
    const title = info.videoDetails.title;
    const thumbnails = info.videoDetails.thumbnail.thumbnails;
    const thumbnailUrl = thumbnails.reduce((prev, curr) => (prev.width > curr.width ? prev : curr)).url;

    res.json({ title, thumbnail: thumbnailUrl });
  } catch (error) {
    handleErrors(res, error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
