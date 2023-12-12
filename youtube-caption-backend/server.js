const express = require('express');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');
const { parseString } = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'https://yt-cap-download.vercel.app' }));
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

        await downloadXml(captionLink, output);
        const textContent = await convertXmlToText(output);

        const txtOutput = `${info.videoDetails.title}.${track.languageCode}.txt`;
        fs.writeFileSync(path.resolve(__dirname, txtOutput), textContent);

        res.download(path.resolve(__dirname, txtOutput), (downloadError) => {
          if (downloadError) {
            console.error('Error downloading file:', downloadError);
            res.status(500).json({ error: 'Error downloading file' });
          } else {
            // Clean up temporary files after download
            fs.unlinkSync(path.resolve(__dirname, txtOutput));
            fs.unlinkSync(path.resolve(__dirname, output));
          }
        });
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

async function downloadXml(url, output) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(path.resolve(__dirname, output));

    https.get(url, (response) => {
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(path.resolve(__dirname, output), () => reject(err));
      });
    });
  });
}

async function convertXmlToText(xmlFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, xmlFile), 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        parseString(data, (parseError, result) => {
          if (parseError) {
            reject(parseError);
          } else {
            resolve(result.transcript.text.join('\n'));
          }
        });
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
