const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "Backend running 🚀",
        endpoints: {
            download: "/download?url=VIDEO_URL"
        }
    });
});

// Main download API
app.get("/download", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({
            error: "Missing TikTok URL"
        });
    }

    try {
        const apiResponse = await axios.get("https://tikwm.com/api/", {
            params: { url },
            timeout: 15000
        });

        const data = apiResponse.data?.data;

        if (!data) {
            return res.status(500).json({
                error: "Failed to fetch video data"
            });
        }

        // Return ALL qualities instead of streaming
        return res.json({
            status: "success",
            title: data.title || null,
            author: data.author?.nickname || null,
            cover: data.cover || null,

            video: {
                hd: data.hdplay || data.play || null,
                sd: data.play || null,
                noWatermark: data.hdplay || data.play || null,
                watermarked: data.wmplay || null
            }
        });

    } catch (err) {
        console.log("ERROR:", err.message);

        return res.status(502).json({
            error: "Failed to process video",
            details: err.message
        });
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
