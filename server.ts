import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { YoutubeTranscript } from "youtube-transcript";
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
        id: 'py_02', 
        title: 'Lập trình Hướng đối tượng OOP chuyên sâu với Python', 
        description: 'Làm chủ các khái niệm nền tảng Class, Object, Kế thừa, Đa hình trong Python để thiết kế hệ thống phần mềm chuyên nghiệp.', 
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80', 
        author: 'Phạm Ngọc Sơn',
        rating: 4.8,
        students: 1800,
        difficulty: 'Trung bình',
        category: 'Lập trình & CNTT',
        lessons: [
          { id: 'py_oop_l1', title: 'Khái niệm Lớp (Class) và Đối tượng (Object)', duration: '14:30', exercise: 'Khởi tạo class Person với các thuộc tính name, age.', videoId: '8mXAIAtUfQU' },
          { id: 'py_oop_l2', title: 'Kế thừa (Inheritance) trong OOP Python', duration: '19:15', exercise: 'Tạo class Student kế thừa từ class Person.', videoId: 'Z9v5SAsW2iM' },
          { id: 'py_oop_l3', title: 'Tính đóng gói và Đa hình', duration: '22:40', exercise: 'Sử dụng các phương thức private và protected.', videoId: '9L77QExavI0' }
        ]
      },
      { 
        id: 'py_03', 
        title: 'Cơ sở dữ liệu và Phân tích số liệu với Python Pandas', 
        description: 'Phân tích, xử lý và trực quan hóa dữ liệu lớn chuẩn hóa với thư viện Pandas, NumPy và Matplotlib.', 
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 
        author: 'Data Insight Team',
        rating: 4.8,
        students: 3100,
        difficulty: 'Trung bình',
        category: 'Lập trình & CNTT',
        lessons: [
          { id: 'py_da_l1', title: 'Làm quen với Pandas Dataframe', duration: '15:20', exercise: 'Đọc dữ liệu từ tệp CSV và in ra 5 dòng đầu tiên.', videoId: 'RfHInp90X-A' },
          { id: 'py_da_l2', title: 'Làm sạch và Tiền xử lý dữ liệu', duration: '21:10', exercise: 'Xử lý các giá trị NaN/rỗng trong cột Tuổi.', videoId: '8mXAIAtUfQU' },
          { id: 'py_da_l3', title: 'Trực quan hóa dữ liệu với Matplotlib', duration: '24:50', exercise: 'Vẽ biểu đồ hình cột biểu diễn doanh số.', videoId: 'Z9v5SAsW2iM' }
        ]
      },
      { 
        id: 'py_04', 
        title: 'Xây dựng Web Application bằng Django & Flask', 
        description: 'Tự tay phát triển các website hoàn chỉnh từ Flask nhỏ gọn đến khối Django mạnh mẽ, kết nối dữ liệu SQL.', 
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', 
        author: 'Web Dev Mastery',
        rating: 4.7,
        students: 1950,
        difficulty: 'Nâng cao',
        category: 'Lập trình & CNTT',
        lessons: [
          { id: 'py_web_l1', title: 'Tạo ứng dụng Web đầu tiên với Flask', duration: '18:40', exercise: 'Tạo ứng dụng Flask hiển thị lời chào theo danh tính.', videoId: '9L77QExavI0' },
          { id: 'py_web_l2', title: 'Kiến trúc MVC và Django Framework', duration: '28:15', exercise: 'Khởi tạo project Django mới cấu hình settings.', videoId: 'RfHInp90X-A' },
          { id: 'py_web_l3', title: 'Kết nối cơ sở dữ liệu và REST API', duration: '31:50', exercise: 'Tạo REST API trả về danh sách sản phẩm.', videoId: '8mXAIAtUfQU' }
        ]
      },
      { 
        id: 'py_05', 
        title: 'Tự động hóa công việc & Cào dữ liệu Web với Python', 
        description: 'Học cách cào dữ liệu từ Website (Web Scraping) bằng Beautiful Soup & Selenium, tối ưu hóa tác vụ văn phòng.', 
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80', 
        author: 'Python Automator',
        rating: 4.9,
        students: 2200,
        difficulty: 'Cơ bản',
        category: 'Lập trình & CNTT',
        lessons: [
          { id: 'py_auto_l1', title: 'Cào dữ liệu (Web Scraping) căn bản', duration: '16:10', exercise: 'Lấy tiêu đề bài báo từ trang tin tức bất kỳ.', videoId: 'Z9v5SAsW2iM' },
          { id: 'py_auto_l2', title: 'Tự động hóa thao tác Excel và PDF', duration: '21:30', exercise: 'Viết mã tự động điền bảng điểm từ file Excel này.', videoId: '9L77QExavI0' },
          { id: 'py_auto_l3', title: 'Viết công cụ gửi email tự động hàng loạt', duration: '19:45', exercise: 'Sử dụng SMTP gửi mail thông báo tự học.', videoId: 'RfHInp90X-A' }
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
          videoEmbeddable: "true",
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
          { id: `${item.id.videoId}_1`, title: 'Bài học 1: Tổng quan', duration: '15:00', exercise: 'Tóm tắt nội dung chính của video.', videoId: item.id.videoId },
          { id: `${item.id.videoId}_2`, title: 'Bài học 2: Thực hành', duration: '25:00', exercise: 'Làm theo hướng dẫn trong video.', videoId: item.id.videoId }
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
      
      console.warn(`YouTube search API info [${errorReason}]: ${errorMessage} - applying featured courses fallback.`);
      
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

  // API: Generate custom AI practice exercise using YouTube transcripts and Gemini
  app.post("/api/generate-exercise", async (req, res) => {
    const { videoId, lessonTitle, courseTitle, category } = req.body;

    if (!lessonTitle || !courseTitle) {
      return res.status(400).json({ error: "Missing required lessonTitle or courseTitle parameters." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    // Step 1: Attempt to fetch the transcript
    let transcriptText = "";
    let transcriptSuccess = false;

    if (videoId) {
      try {
        console.log(`[API] Fetching transcript for video: ${videoId}`);
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        if (transcript && transcript.length > 0) {
          transcriptText = transcript.map(t => t.text).join(" ");
          transcriptSuccess = true;
          // Limit to 30000 chars as requested
          if (transcriptText.length > 30000) {
            transcriptText = transcriptText.substring(0, 30000);
          }
          console.log(`[API] Successfully retrieved transcript of ${transcriptText.length} characters.`);
        }
      } catch (err: any) {
        console.warn(`[API] Could not fetch transcript for ${videoId}: ${err.message}. Proceeding with course context fallback.`);
      }
    }

    // Step 2: Prompt Gemini with the transcript and metadata to generate customized exercises
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const catNormalized = (category || "").toLowerCase();
      const isIT = catNormalized.includes("lập trình") || catNormalized.includes("cntt") || catNormalized.includes("tech") || courseTitle.toLowerCase().includes("python") || courseTitle.toLowerCase().includes("javascript") || courseTitle.toLowerCase().includes("deep learning");
      const isLanguage = catNormalized.includes("ngoại ngữ") || catNormalized.includes("ielts") || catNormalized.includes("toeic") || courseTitle.toLowerCase().includes("tiếng anh");

      const exerciseType = isIT ? "code_challenge" : (isLanguage ? "quiz" : "qa_writing");

      const systemPrompt = `Bạn là một trợ lý giáo dục AI chuyên nghiệp thiết kế bài tập thực hành chất lượng cao cho nền tảng học trực tuyến thông minh.
Hãy thiết kế một bài tập thực hành chi tiết dựa trên bài học thuộc khóa học sau:
- Khóa học: ${courseTitle}
- Bài học: ${lessonTitle}
- Danh mục: ${category || "Khác"}
- Thể loại bài tập tối ưu: ${exerciseType} (Nếu là Lập trình/CNTT, hãy chọn "code_challenge". Nếu là Ngoại ngữ, chọn "quiz" trắc nghiệm. Khác thì chọn "qa_writing" để tự luận trả lời câu hỏi).

Dưới đây là nội dung chi tiết transcript (bản dịch phụ đề) thu thập từ video bài học để bạn phân tích nội dung giảng dạy (nếu có):
"""
${transcriptText || "Không tìm thấy phụ đề. Hãy thiết kế bài tập bám sát nhất theo tiêu đề bài học và bối cảnh khóa học của học viên."}
"""

Yêu cầu bài tập:
1. Đảm bảo nội dung thực tế, bám sát kiến thức được học trong video bài học hoặc bám sát tiêu đề của bài học.
2. Nếu là "code_challenge", cung cấp starterCode mẫu rõ ràng kèm chỉ dẫn giải thích trong description, cùng test cases / kết quả mong đợi.
3. Nếu là "quiz", tạo tối thiểu 3 câu hỏi trắc nghiệm chất lượng cao bám sát nội dung, kèm đáp án đúng và lời giải thích kỹ càng bằng tiếng Việt.
4. Nếu là "qa_writing", tạo tối thiểu 2 câu hỏi tự luận/suy ngẫm sâu sắc, kèm theo "suggestedAnswer" mẫu chi tiết để người học đối chiếu tự ôn tập.
5. Ngôn ngữ: Toàn bộ hiển thị bằng Tiếng Việt (hoặc Tiếng Anh nếu là đề ngoại ngữ IELTS/TOEIC nhưng giải thích đáp án bằng Tiếng Việt).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Tiêu đề bài tập thực hành sinh động"
              },
              type: {
                type: Type.STRING,
                description: "Kiểu bài tập: 'code_challenge', 'quiz', 'qa_writing'"
              },
              description: {
                type: Type.STRING,
                description: "Mô tả chi tiết yêu cầu bài tập và kiến thức trọng tâm (sử dụng Markdown, trình bày khoa học)"
              },
              codeChallenge: {
                type: Type.OBJECT,
                properties: {
                  starterCode: { type: Type.STRING, description: "Mã nguồn ban đầu để người học sửa tiếp (nếu có)" },
                  language: { type: Type.STRING, description: "Ngôn ngữ lập trình (ví dụ: python, javascript)" },
                  instructions: { type: Type.STRING, description: "Hướng dẫn thực hiện bài tập code" },
                  expectedOutput: { type: Type.STRING, description: "Đầu ra mong đợi của chương trình" }
                }
              },
              quizQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: "Câu hỏi trắc nghiệm" },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "4 phương án trả lời"
                    },
                    correctAnswerIdx: { type: Type.INTEGER, description: "Chỉ số đáp án đúng (0-3)" },
                    explanation: { type: Type.STRING, description: "Giải thích chi tiết vì sao đáp án đó đúng bằng tiếng Việt" }
                  },
                  required: ["question", "options", "correctAnswerIdx", "explanation"]
                }
              },
              writingTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    prompt: { type: Type.STRING, description: "Câu hỏi thảo luận/tự luận" },
                    suggestedAnswer: { type: Type.STRING, description: "Lời giải/Gợi ý câu trả lời hoàn chỉnh mẫu" }
                  },
                  required: ["prompt", "suggestedAnswer"]
                }
              }
            },
            required: ["title", "type", "description"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini AI.");
      }

      const parsedResult = JSON.parse(resultText);
      res.json({
        success: true,
        transcriptRetrieved: transcriptSuccess,
        exercise: parsedResult
      });

    } catch (geminiErr: any) {
      console.error("[API] Error generating exercise with Gemini:", geminiErr);
      res.status(500).json({ error: `AI Generation failed: ${geminiErr.message}` });
    }
  });

  // API: Review student's code challenge response
  app.post("/api/review-code", async (req, res) => {
    const { code, starterCode, instructions, expectedOutput, lessonTitle } = req.body;

    if (!code) {
      return res.status(400).json({ error: "No code submitted." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const reviewPrompt = `Bạn là một giảng viên lập trình chuyên nghiệp và tận tâm.
Hãy đánh giá bài nộp code của học viên cho bài tập lập trình "${lessonTitle}".

Yêu cầu bài tập:
- Đề bài: ${instructions}
- Mã nguồn mẫu ban đầu: ${starterCode || "Không có"}
- Đầu ra mong đợi: ${expectedOutput || "Không có"}

Mã nguồn học viên đã viết và nộp:
\`\`\`python
${code}
\`\`\`

Hãy phân tích và trả về kết quả dưới định dạng JSON theo schema chính xác bên dưới. Giải thích rõ lỗi sai (nếu có), nhận xét về cấu trúc, độ tối ưu và gợi ý cải tiến một cách tích cực bằng tiếng Việt.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: reviewPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              passed: { type: Type.BOOLEAN, description: "True nếu code giải quyết đúng yêu cầu đề bài, False nếu có lỗi nghiêm trọng hoặc không chạy đúng" },
              score: { type: Type.INTEGER, description: "Điểm số đánh giá từ 0 đến 100" },
              feedback: { type: Type.STRING, description: "Lời nhận xét chi tiết, chỉ ra lỗi và điểm tốt trong code của học viên bằng tiếng Việt" },
              refactoredCode: { type: Type.STRING, description: "Phiên bản mã nguồn tối ưu/chuẩn mẫu hơn do bạn gợi ý (nếu cần)" }
            },
            required: ["passed", "score", "feedback"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini AI.");
      }

      res.json(JSON.parse(resultText));
    } catch (err: any) {
      console.error("[API] Error reviewing code:", err);
      res.status(500).json({ error: `AI Review failed: ${err.message}` });
    }
  });

  // API: Generate Lesson Quiz
  app.post("/api/generate-quiz", async (req, res) => {
    const { title, description, exercise } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Missing required lesson title parameter." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemPrompt = `Bạn là một chuyên gia giáo dục EdTech.
Hãy thiết kế đúng 3 câu hỏi trắc nghiệm chất lượng cao để kiểm tra kiến thức của học viên sau khi họ hoàn thành bài học này.
- Tiêu đề bài học: ${title}
- Mô tả bài học/Nội dung: ${description || "Không có mô tả chi tiết"}
- Thử thách/Bài tập đi kèm: ${exercise || "Không có bài tập đi kèm"}

Yêu cầu:
1. Tạo đúng 3 câu hỏi trắc nghiệm (Multiple Choice Questions) bằng tiếng Việt.
2. Mỗi câu hỏi phải có đúng 4 lựa chọn (options).
3. Đặt chỉ số đáp án đúng (correctIndex) từ 0 đến 3.
4. Câu hỏi nên tập trung vào các khái niệm cốt lõi, tư duy phân tích hoặc ứng dụng thực tế của bài học.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "Câu hỏi trắc nghiệm bằng Tiếng Việt" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Bốn phương án trả lời bằng Tiếng Việt"
                },
                correctIndex: { type: Type.INTEGER, description: "Chỉ số của đáp án đúng (0-3)" }
              },
              required: ["question", "options", "correctIndex"]
            }
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini AI.");
      }

      res.json(JSON.parse(resultText));
    } catch (err: any) {
      console.error("[API] Error in generating quiz:", err);
      res.status(500).json({ error: `AI Quiz Generation failed: ${err.message}` });
    }
  });

  // API: General Chat with AI Assistant
  app.post("/api/chat", async (req, res) => {
    const { messages, userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Map chat messages format correctly
      const contents = [
        ...(messages || []).map((m: any) => ({
          role: m.role === "model" ? "model" as const : "user" as const,
          parts: [{ text: m.text }]
        })),
        { role: "user" as const, parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "Bạn là trợ lý AI thân thiện của trang web Self-Study Hub. Hãy tư vấn về lộ trình học tập, tài liệu và kỹ năng cho sinh viên Việt Nam. Trả lời ngắn gọn, chuyên nghiệp và sử dụng Markdown.",
        }
      });

      const botResponse = response.text || "Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại nhé!";
      res.json({ text: botResponse });
    } catch (err: any) {
      console.error("[API] Error in AI Assistant chat:", err);
      res.status(500).json({ error: `AI Assistant Chat failed: ${err.message}` });
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
