const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// Download API
app.get("/download", async (req, res) => {
    const url = req.query.url;
    const quality = req.query.quality || "hd";

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    try {
        // Get TikTok data
        const apiResponse = await axios.get("https://tikwm.com/api/", {
            params: { url },
            timeout: 10000
        });

        const data = apiResponse.data?.data;

        if (!data) {
            return res.status(500).json({ error: "No video data found" });
        }

        // Select quality
        let videoUrl;

        if (quality === "sd") {
            videoUrl = data.play;
        } else if (quality === "wm") {
            videoUrl = data.wmplay;
        } else {
            videoUrl = data.hdplay || data.play;
        }

        if (!videoUrl) {
            return res.status(500).json({ error: "No video URL found" });
        }

        console.log("Quality:", quality);
        console.log("Streaming URL:", videoUrl);

        // Stream video
        const response = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream",
            timeout: 20000
        });

        res.setHeader("Content-Type", "video/mp4");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=tiktok.mp4"
        );

        response.data.pipe(res);

    } catch (err) {
        console.log("ERROR:", err.message);

        res.status(502).json({
            error: "Failed to fetch video",
            details: err.message
        });
    }
});

// Use Railway/Render port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
