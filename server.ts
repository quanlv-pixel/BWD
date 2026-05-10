import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: YouTube Courses Proxy
  app.get("/api/courses", async (req, res) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const query = req.query.q as string || "lập trình web 2024 kỹ năng tự học";

    if (!apiKey) {
      // Fallback data if no API key is provided
      return res.json([
        { 
          id: '1', 
          title: 'Khóa học ReactJS căn bản cho người mới', 
          description: 'Học ReactJS từ zero đến hero trong năm 2024.', 
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee', 
          author: 'Self-Study Hub' 
        },
        { 
          id: '2', 
          title: 'Làm chủ JavaScript hiện đại', 
          description: 'Tận dụng sức mạnh của ES6+ để xây dựng ứng dụng web.', 
          thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a', 
          author: 'Community Hub' 
        }
      ]);
    }

    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          maxResults: 6,
          q: query,
          type: "video",
          key: apiKey
        }
      });

      const courses = response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        author: item.snippet.channelTitle,
        date: item.snippet.publishedAt
      }));

      res.json(courses);
    } catch (error: any) {
      console.error("YouTube Error:", error.response?.data || error.message);
      // Fallback data if API key is invalid or quota exceeded
      res.json([
        { 
          id: 'j942wKiXFu8', 
          title: 'Khóa học ReactJS cho người mới bắt đầu', 
          description: 'Học ReactJS một cách bài bản qua các dự án thực tế.', 
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee', 
          author: 'Self-Study Hub' 
        },
        { 
          id: 'v_zS_pRE8fQ', 
          title: 'JavaScript cơ bản đến nâng cao (2024)', 
          description: 'Nắm vững các khái niệm then chốt của JavaScript hiện đại.', 
          thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a', 
          author: 'Community Hub' 
        }
      ]);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serving static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
