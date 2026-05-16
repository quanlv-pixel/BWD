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
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', 
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
        id: 'js_01', 
        title: 'JavaScript Modern ES6+: Từ Zero đến Hero', 
        description: 'Làm chủ JavaScript hiện đại để xây dựng các ứng dụng Web tương tác mạnh mẽ.', 
        thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80', 
        author: 'Web Dev Mastery',
        rating: 4.8,
        students: 3800,
        difficulty: 'Trung bình',
        category: 'Lập trình & CNTT',
        lessons: [
          { id: 'js_l1', title: 'Let, Const và Arrow Functions', duration: '15:00', exercise: 'Chuyển đổi các hàm cũ sang Arrow function.', videoId: 'PkZNo7MFNFg' }
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
        id: 'toeic_01', 
        title: 'Bí kíp chinh phục TOEIC 900+', 
        description: 'Tổng hợp các mẹo làm bài Part 5, 6, 7 và bộ từ vựng thường gặp trong đề thi.', 
        thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80', 
        author: 'Toeic Ninja',
        rating: 4.7,
        students: 4200,
        difficulty: 'Cơ bản',
        category: 'Ngoại Ngữ',
        lessons: [
          { id: 'toe_l1', title: 'Ngữ pháp TOEIC trọng tâm', duration: '25:00', exercise: 'Làm 50 câu hỏi trắc nghiệm ngữ pháp Part 5.', videoId: 'GndUwaS6Bik' }
        ]
      },
      { 
        id: 'mkt_01', 
        title: 'Digital Marketing Fundamentals 2026', 
        description: 'Tổng quan về SEO, Facebook Ads và xu hướng Content Marketing mới nhất.', 
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', 
        author: 'Marketing Pro',
        rating: 4.7,
        students: 3200,
        difficulty: 'Cơ bản',
        category: 'Kinh tế - Marketing',
        lessons: [
          { id: 'mkt_l1', title: 'SEO On-page cơ bản', duration: '18:00', exercise: 'Viết tiêu đề và mô tả chuẩn SEO cho 1 bài viết.', videoId: 'hF515-0Tduk' }
        ]
      },
      { 
        id: 'finance_01', 
        title: 'Quản lý tài chính cá nhân cho người trẻ', 
        description: 'Cách lập ngân sách, đầu tư quỹ chỉ số và xây dựng nền tảng tài chính bền vững.', 
        thumbnail: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=800&q=80', 
        author: 'Financial Freedom',
        rating: 4.9,
        students: 6100,
        difficulty: 'Dễ',
        category: 'Kinh tế - Marketing',
        lessons: [
          { id: 'fin_l1', title: 'Quy tắc 50/30/20', duration: '15:00', exercise: 'Lập bảng chi tiêu hàng tháng theo quy tắc này.', videoId: '57fIs3D8Zuk' }
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
          { id: 'soft_l1', title: 'Kỹ thuật Storytelling', duration: '22:00', exercise: 'Kể một câu chuyện ngắn trong vòng 2 phút.', videoId: 'Nj-hdQMa3uA' }
        ]
      },
      { 
        id: 'time_01', 
        title: 'Quản lý thời gian & Năng suất đột phá', 
        description: 'Phương pháp Pomodoro, Deep Work và cách loại bỏ trì hoãn hiệu quả.', 
        thumbnail: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?auto=format&fit=crop&w=800&q=80', 
        author: 'Productivity King',
        rating: 4.8,
        students: 2900,
        difficulty: 'Cơ bản',
        category: 'Kỹ năng mềm',
        lessons: [
          { id: 'time_l1', title: 'Deep Work Workflow', duration: '20:00', exercise: 'Thiết lập thời gian biểu Deep Work cho tuần tới.', videoId: 'Z_S_fT4S-cE' }
        ]
      },
      { 
        id: 'dl_01', 
        title: 'Deep Learning căn bản với TensorFlow', 
        description: 'Học về Mạng thần kinh nhân tạo (Neural Networks) và ứng dụng trong nhận diện hình ảnh.', 
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', 
        author: 'AI Researcher',
        rating: 4.9,
        students: 1200,
        difficulty: 'Nâng cao',
        category: 'Lập trình & CNTT',
        lessons: [
          { id: 'dl_l1', title: 'Giới thiệu về Neural Networks', duration: '30:00', exercise: 'Xây dựng model perceptron đơn giản.', videoId: 'aircAruvnKk' }
        ]
      },
      { 
        id: 'ai_01', 
        title: 'Trí tuệ nhân tạo (AI) cho mọi người', 
        description: 'Hiểu về tương lai của công nghệ, Machine Learning và đạo đức trong AI.', 
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', 
        author: 'Tech Futurist',
        rating: 4.8,
        students: 5500,
        difficulty: 'Cơ bản',
        category: 'Lập trình & CNTT',
        lessons: [
          { id: 'ai_l1', title: 'Generative AI là gì?', duration: '20:00', exercise: 'Sử dụng ChatGPT hiệu quả với Prompt Engineering.', videoId: '2ePf9rue1ao' }
        ]
      }
    ];

    if (!query || query === "tất cả") {
      return res.json(FEATURED_COURSES);
    }

    // Attempt to match local first - better for "deep learning" accuracy
    const localMatches = FEATURED_COURSES.filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.description.toLowerCase().includes(query) ||
      (c.category && c.category.toLowerCase().includes(query))
    );

    // If query is specifically "deep learning" or similar, we want to ensure high quality results
    if (!apiKey) {
      return res.json(localMatches);
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

      const youtubeCourses = response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        author: item.snippet.channelTitle,
        rating: 4.5,
        students: Math.floor(Math.random() * 5000),
        difficulty: 'Tự học',
        lessons: [
          { id: `${item.id.videoId}_1`, title: 'Bài học 1: Tổng quan', duration: '15:00', exercise: 'Tóm tắt nội dung chính của video.' },
          { id: `${item.id.videoId}_2`, title: 'Bài học 2: Thực hành', duration: '25:00', exercise: 'Làm theo hướng dẫn trong video.' }
        ]
      }));

      // Combine local matches with YouTube results, unique by title
      const combined = [...localMatches];
      youtubeCourses.forEach((yt: any) => {
        if (!combined.some(c => c.title.toLowerCase() === yt.title.toLowerCase())) {
          combined.push(yt);
        }
      });

      res.json(combined);
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error?.message || error.message;
      const errorReason = errorData?.error?.errors?.[0]?.reason || "unknown";
      
      console.error(`YouTube API Error [${errorReason}]: ${errorMessage}`);
      
      // Enhanced fallback search in featured courses
      const filteredFallback = FEATURED_COURSES.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query) ||
        (c.category && c.category.toLowerCase().includes(query))
      );
      
      // Return filtered fallback results
      res.json(filteredFallback);
    }
  });

  // API for search suggestions (autocomplete)
  app.get("/api/search-suggestions", async (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    if (!query || query.length < 2) return res.json([]);

    // Suggestions from featured courses titles
    const SUGGESTION_POOL = [
      'Lập trình Python từ cơ bản đến nâng cao',
      'JavaScript Modern ES6+: Từ Zero đến Hero',
      'Lộ trình học IELTS 7.0+ cho người mất gốc',
      'Bí kíp chinh phục TOEIC 900+',
      'Digital Marketing Fundamentals 2026',
      'Quản lý tài chính cá nhân cho người trẻ',
      'Kỹ năng Thuyết trình lôi cuốn',
      'Quản lý thời gian & Năng suất đột phá',
      'Deep Learning căn bản với TensorFlow',
      'Trí tuệ nhân tạo (AI) cho mọi người'
    ];

    const suggestions = SUGGESTION_POOL
      .filter(title => title.toLowerCase().includes(query))
      .slice(0, 5)
      .map((title, index) => ({ id: `suggest_${index}`, title, type: 'course' }));

    res.json(suggestions);
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
