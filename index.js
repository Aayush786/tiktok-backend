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

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    try {
        // TikTok extractor API
        const apiResponse = await axios.get("https://tikwm.com/api/", {
            params: { url }
        });

        const data = apiResponse.data.data;

        if (!data || !data.play) {
            return res.status(500).json({ error: "Video not found" });
        }

        const videoUrl = data.play;

        // Stream video
        const videoStream = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream"
        });

        res.setHeader("Content-Type", "video/mp4");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=tiktok.mp4"
        );

        videoStream.data.pipe(res);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});