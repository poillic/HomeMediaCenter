const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());

// Serve static files in the /music directory
const musicDirectory = path.join(__dirname, "music");
app.use("/music", express.static(musicDirectory));

app.use(express.static(path.join(__dirname, "public")));

// API: List all music files in /music
app.get("/api/music", (req, res) => {
  fs.readdir(musicDirectory, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read music directory." });
    }

    const musicFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return [".mp3", ".flac", ".wav", ".m4a", ".ogg"].includes(ext);
    });

    const response = musicFiles.map(file => ({
      name: file,
      url: `/music/${encodeURIComponent(file)}`,
    }));

    res.json(response);
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/upload", (req, res) => {
  const boundary = req.headers["content-type"].split("boundary=")[1];
  let rawData = Buffer.alloc(0);

  req.on("data", chunk => {
    rawData = Buffer.concat([rawData, chunk]);
  });

  req.on("end", () => {
    const raw = rawData.toString();

    // Extract file content from multipart form data
    const start = raw.indexOf("filename=\"") + 10;
    const end = raw.indexOf("\"", start);
    const filename = raw.substring(start, end);

    const fileStart = rawData.indexOf("\r\n\r\n") + 4;
    const fileEnd = rawData.lastIndexOf(`--${boundary}--`) - 2;
    const fileBuffer = rawData.slice(fileStart, fileEnd);

    const destPath = path.join(musicDirectory, filename);

    fs.writeFile(destPath, fileBuffer, err => {
      if (err) return res.status(500).json({ error: "Failed to save file." });
      res.json({ message: "File uploaded successfully", file: filename });
      req.redirect("/");
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Music server is running at http://localhost:${PORT}`);
});
