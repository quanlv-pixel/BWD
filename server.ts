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

  // API Route: Enhanced Courses Proxy with Search, Sorting and Progress Metadata
  app.get("/api/courses", async (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    // High-quality Featured Mock Data
    const FEATURED_COURSES = [
      { 
        id: 'py_01', 
        title: 'Lập trình Python từ cơ bản đến nâng cao', 
        description: 'Khóa học toàn diện về Python, từ cú pháp căn bản đến xử lý dữ liệu và AI.', 
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', 
        author: 'Python Expert',
        rating: 4.9,
        students: 2500,
        difficulty: 'Cơ bản',
        category: 'Lập trình & CNTT',
        lessons: [
          { id: 'py_l1', title: 'Cài đặt và Chạy code đầu tiên', duration: '12:00', exercise: 'Cài đặt Python 3.x và in ra "Hello World"', videoId: 'RfHInp90X-A' },
          { id: 'py_l2', title: 'Biến và các Phép tính', duration: '18:00', exercise: 'Viết chương trình tính diện tích hình tròn', videoId: '8mXAIAtUfQU' },
          { id: 'py_l3', title: 'Cấu trúc Điều khiển If-Else', duration: '25:00', exercise: 'Kiểm tra một số là chẵn hay lẻ', videoId: 'Z9v5SAsW2iM' },
          { id: 'py_l4', title: 'Vòng lặp For và While', duration: '30:00', exercise: 'In ra bảng cửu chương từ 1 đến 10', videoId: '9L77QExavI0' }
        ]
      },
      { 
        id: 'ielts_01', 
        title: 'Lộ trình học IELTS 7.0+ cho người mất gốc', 
        description: 'Phương pháp học Listening và Reading hiệu quả giúp bạn đạt mục tiêu nhanh chóng.', 
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80', 
        author: 'IELTS Master',
        rating: 4.8,
        students: 5400,
        difficulty: 'Trung bình',
        category: 'Ngoại Ngữ',
        lessons: [
          { id: 'iel_l1', title: 'Luyện nghe Part 1', duration: '20:00', exercise: 'Hoàn thành bài nghe đục lỗ trong file đính kèm.', videoId: 'sR6v0S_z_9s' },
          { id: 'iel_l2', title: 'Chiến thuật Reading', duration: '35:00', exercise: 'Đọc và trả lời 10 câu hỏi True/False/Not Given.', videoId: 'q5p6X00D8U0' }
        ]
      },
      { 
        id: 'mkt_01', 
        title: 'Digital Marketing Fundamentals 2026', 
        description: 'Tổng quan về SEO, Facebook Ads và xu hướng Content Marketing mới nhất.', 
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', 
        author: 'Marketing Pro',
        rating: 4.7,
        students: 3200,
        difficulty: 'Cơ bản',
        category: 'Kinh tế - Marketing',
        lessons: [
          { id: 'mkt_l1', title: 'SEO On-page cơ bản', duration: '18:00', exercise: 'Viết tiêu đề và mô tả chuẩn SEO cho 1 bài viết.', videoId: 'DvwS7cV9GmQ' }
        ]
      },
      { 
        id: 'soft_01', 
        title: 'Kỹ năng Thuyết trình lôi cuốn', 
        description: 'Làm chủ giọng nói và ngôn ngữ cơ thể để tự tin trước đám đông.', 
        thumbnail: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80', 
        author: 'Coach Thinh',
        rating: 4.9,
        students: 1500,
        difficulty: 'Dễ',
        category: 'Kỹ năng mềm',
        lessons: [
          { id: 'soft_l1', title: 'Kỹ thuật Storytelling', duration: '22:00', exercise: 'Kể một câu chuyện ngắn trong vòng 2 phút.', videoId: 'HAnw168huqA' }
        ]
      }
    ];

    if (!query || query === "tất cả") {
      return res.json(FEATURED_COURSES);
    }

    // Attempt to search YouTube if query exists
    if (!apiKey) {
      // Fallback: Search mock data if no API key
      const filtered = FEATURED_COURSES.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query) ||
        c.category?.toLowerCase().includes(query)
      );
      return res.json(filtered);
    }


    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          maxResults: 8,
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
        rating: 4.5, // Default for external search
        students: Math.floor(Math.random() * 5000),
        difficulty: 'Tự học',
        lessons: [
          { id: `${item.id.videoId}_1`, title: 'Bài học 1: Tổng quan', duration: '15:00', exercise: 'Tóm tắt nội dung chính của video.' },
          { id: `${item.id.videoId}_2`, title: 'Bài học 2: Thực hành', duration: '25:00', exercise: 'Làm theo hướng dẫn trong video.' }
        ]
      }));

      res.json(courses);
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error?.message || error.message;
      const errorReason = errorData?.error?.errors?.[0]?.reason || "unknown";
      
      console.error(`YouTube API Error [${errorReason}]: ${errorMessage}`);
      
      if (errorReason === "quotaExceeded") {
        console.warn("YouTube API Quota exceeded. Using internal course database fallback.");
      }

      // Enhanced fallback search in featured courses
      const filteredFallback = FEATURED_COURSES.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query)
      );
      
      // Return filtered fallback if matches found, otherwise return all featured courses
      res.json(filteredFallback.length > 0 ? filteredFallback : FEATURED_COURSES);
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
