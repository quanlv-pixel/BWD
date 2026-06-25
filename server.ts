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

// ─────────────────────────────────────────────────────────────────────────────
// In-memory YouTube search cache (TTL: 10 minutes)
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
interface CacheEntry { data: any; expiresAt: number; }
const searchCache = new Map<string, CacheEntry>();

function getCached(key: string): any | null {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    searchCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any): void {
  searchCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─────────────────────────────────────────────────────────────────────────────
// Robust FEATURED_COURSES fallback — used when YouTube quota is exceeded
// ─────────────────────────────────────────────────────────────────────────────
const FEATURED_COURSES = [
  {
    id: "py_01",
    videoId: "RfHInp90X-A",
    title: "Lập trình Python từ cơ bản đến nâng cao",
    description: "Khóa học toàn diện về Python, từ cú pháp căn bản đến xử lý dữ liệu và AI.",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    author: "Python Expert",
    rating: 4.9,
    students: 2500,
    difficulty: "Cơ bản",
    category: "Lập trình & CNTT",
    lessons: [
      { id: "py_l1", title: "Cài đặt và Chạy code đầu tiên", duration: "12:00", exercise: "Cài đặt Python 3.x và in ra \"Hello World\"", videoId: "RfHInp90X-A" },
      { id: "py_l2", title: "Biến và các Phép tính", duration: "18:00", exercise: "Viết chương trình tính diện tích hình tròn", videoId: "8mXAIAtUfQU" },
      { id: "py_l3", title: "Cấu trúc Điều khiển If-Else", duration: "25:00", exercise: "Kiểm tra một số là chẵn hay lẻ", videoId: "Z9v5SAsW2iM" },
      { id: "py_l4", title: "Vòng lặp For và While", duration: "30:00", exercise: "In ra bảng cửu chương từ 1 đến 10", videoId: "9L77QExavI0" }
    ]
  },
  {
    id: "js_01",
    videoId: "PkZNo7MFNFg",
    title: "JavaScript Modern ES6+: Từ Zero đến Hero",
    description: "Làm chủ JavaScript hiện đại để xây dựng các ứng dụng Web tương tác mạnh mẽ.",
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80",
    author: "Web Dev Mastery",
    rating: 4.8,
    students: 3800,
    difficulty: "Trung bình",
    category: "Lập trình & CNTT",
    lessons: [
      { id: "js_l1", title: "Let, Const và Arrow Functions", duration: "15:00", exercise: "Chuyển đổi các hàm cũ sang Arrow function.", videoId: "PkZNo7MFNFg" },
      { id: "js_l2", title: "Promises và Async/Await", duration: "22:00", exercise: "Viết hàm fetch data từ API công khai.", videoId: "DHvZLI7Db8E" }
    ]
  },
  {
    id: "dl_01",
    videoId: "aircAruvnKk",
    title: "Deep Learning căn bản với TensorFlow",
    description: "Học về Mạng thần kinh nhân tạo (Neural Networks) và ứng dụng trong nhận diện hình ảnh.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    author: "AI Researcher",
    rating: 4.9,
    students: 1200,
    difficulty: "Nâng cao",
    category: "Lập trình & CNTT",
    lessons: [
      { id: "dl_l1", title: "Giới thiệu về Neural Networks", duration: "30:00", exercise: "Xây dựng model perceptron đơn giản.", videoId: "aircAruvnKk" },
      { id: "dl_l2", title: "Gradient Descent & Back-propagation", duration: "35:00", exercise: "Triển khai thuật toán gradient descent tay.", videoId: "IHZwWFHWa-w" }
    ]
  },
  {
    id: "ielts_01",
    videoId: "sR6v0S_z_9s",
    title: "Lộ trình học IELTS 7.0+ cho người mất gốc",
    description: "Phương pháp học Listening và Reading hiệu quả giúp bạn đạt mục tiêu nhanh chóng.",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    author: "IELTS Master",
    rating: 4.8,
    students: 5400,
    difficulty: "Trung bình",
    category: "Ngoại Ngữ",
    lessons: [
      { id: "iel_l1", title: "Luyện nghe Part 1", duration: "20:00", exercise: "Hoàn thành bài nghe đục lỗ trong file đính kèm.", videoId: "sR6v0S_z_9s" },
      { id: "iel_l2", title: "Chiến thuật Reading", duration: "35:00", exercise: "Đọc và trả lời 10 câu hỏi True/False/Not Given.", videoId: "q5p6X00D8U0" }
    ]
  }
];

// Build the standard { primary, alternativeVideos, items } envelope from the mock list
function buildMockEnvelope(list: typeof FEATURED_COURSES) {
  if (list.length === 0) return { primary: null, alternativeVideos: [], items: [] };
  const [first, ...rest] = list;
  return { primary: first, alternativeVideos: rest, items: list };
}

// ─────────────────────────────────────────────────────────────────────────────
// Centralized AI helper: tries multiple Gemini models with a 15 s timeout each
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
const GEMINI_TIMEOUT_MS = 15_000;

async function generateWithFallback(ai: GoogleGenAI, contents: any, config: any): Promise<string> {
  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[AI] Trying model: ${model}`);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${GEMINI_TIMEOUT_MS / 1000}s on ${model}`)), GEMINI_TIMEOUT_MS)
      );

      const aiPromise = ai.models.generateContent({ model, contents, config });

      const response = await Promise.race([aiPromise, timeoutPromise]);
      const text = (response as any).text;

      if (!text) throw new Error(`Empty response from ${model}`);
      console.log(`[AI] Success with model: ${model}`);
      return text;
    } catch (err: any) {
      const msg: string = err?.message || String(err);
      const isRetryable =
        msg.includes("503") ||
        msg.includes("UND_ERR_HEADERS_TIMEOUT") ||
        msg.includes("Timeout") ||
        msg.includes("overloaded") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("fetch failed");

      console.warn(`[AI] Model ${model} failed${isRetryable ? " (retryable)" : ""}: ${msg}`);
      lastError = err;

      if (!isRetryable) {
        // Non-retryable error (e.g. invalid key, bad request) — no point trying other models
        throw err;
      }
      // Otherwise continue to next model
    }
  }

  throw new Error(
    `AI models are currently overloaded. Please try again. (Last error: ${lastError?.message})`
  );
}

// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ── /api/courses ────────────────────────────────────────────────────────────
  // Dynamic YouTube fetch with in-memory cache + FEATURED_COURSES quota fallback
  app.get("/api/courses", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    const apiKey = process.env.YOUTUBE_API_KEY;

    const searchTerm = query || "lập trình web javascript tutorial";

    // Check in-memory cache first to save YouTube quota
    const cached = getCached(searchTerm);
    if (cached) {
      console.log(`[Cache] HIT for "${searchTerm}"`);
      return res.json(cached);
    }

    if (!apiKey) {
      console.warn("[API] YOUTUBE_API_KEY not configured — serving FEATURED_COURSES fallback.");
      return res.json(buildMockEnvelope(FEATURED_COURSES));
    }

    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          maxResults: 9,
          q: searchTerm,
          type: "video",
          videoEmbeddable: "true",
          relevanceLanguage: "vi",
          key: apiKey
        }
      });

      const rawItems: any[] = response.data.items || [];

      if (rawItems.length === 0) {
        const fallback = buildMockEnvelope(FEATURED_COURSES);
        setCache(searchTerm, fallback);
        return res.json(fallback);
      }

      const mapItem = (item: any) => ({
        id: item.id.videoId,
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail:
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
        author: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        lessons: [
          {
            id: `${item.id.videoId}_1`,
            title: item.snippet.title,
            duration: "—",
            exercise: "Xem video và tóm tắt các điểm chính bạn học được.",
            videoId: item.id.videoId
          }
        ],
        rating: 4.5,
        students: 0,
        difficulty: "Tự học",
        category: "YouTube"
      });

      const [firstItem, ...restItems] = rawItems;
      const primary = mapItem(firstItem);
      const alternativeVideos = restItems.map(mapItem);

      const envelope = { primary, alternativeVideos, items: [primary, ...alternativeVideos] };
      setCache(searchTerm, envelope);

      return res.json(envelope);
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error?.message || error.message;
      const errorReason = errorData?.error?.errors?.[0]?.reason || "unknown";

      console.warn(
        `[API] YouTube search failed [${errorReason}]: ${errorMessage} — serving FEATURED_COURSES fallback.`
      );

      // 403 quota exceeded or any other YouTube API error → graceful mock fallback
      const fallback = buildMockEnvelope(FEATURED_COURSES);
      return res.json(fallback);
    }
  });

  // ── /api/search-suggestions ──────────────────────────────────────────────────
  app.get("/api/search-suggestions", async (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    if (!query || query.length < 2) return res.json([]);

    const SUGGESTION_POOL = [
      "Lập trình Python từ cơ bản đến nâng cao",
      "JavaScript Modern ES6+: Từ Zero đến Hero",
      "Lộ trình học IELTS 7.0+ cho người mất gốc",
      "Bí kíp chinh phục TOEIC 900+",
      "Digital Marketing Fundamentals 2026",
      "Quản lý tài chính cá nhân cho người trẻ",
      "Kỹ năng Thuyết trình lôi cuốn",
      "Quản lý thời gian & Năng suất đột phá",
      "Deep Learning căn bản với TensorFlow",
      "Trí tuệ nhân tạo (AI) cho mọi người"
    ];

    const suggestions = SUGGESTION_POOL
      .filter(title => title.toLowerCase().includes(query))
      .slice(0, 5)
      .map((title, index) => ({ id: `suggest_${index}`, title, type: "course" }));

    res.json(suggestions);
  });

  // ── /api/generate-exercise ───────────────────────────────────────────────────
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
          if (transcriptText.length > 30000) {
            transcriptText = transcriptText.substring(0, 30000);
          }
          console.log(`[API] Transcript retrieved: ${transcriptText.length} characters.`);
        }
      } catch (err: any) {
        console.warn(`[API] Transcript fetch failed for ${videoId}: ${err.message}. Using context fallback.`);
      }
    }

    // Step 2: Prompt Gemini using the centralized fallback helper
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      const catNormalized = (category || "").toLowerCase();
      const isIT = catNormalized.includes("lập trình") || catNormalized.includes("cntt") || catNormalized.includes("tech") ||
        courseTitle.toLowerCase().includes("python") || courseTitle.toLowerCase().includes("javascript") ||
        courseTitle.toLowerCase().includes("deep learning");
      const isLanguage = catNormalized.includes("ngoại ngữ") || catNormalized.includes("ielts") ||
        catNormalized.includes("toeic") || courseTitle.toLowerCase().includes("tiếng anh");
      const exerciseType = isIT ? "code_challenge" : isLanguage ? "quiz" : "qa_writing";

      const systemPrompt = `Bạn là một trợ lý giáo dục AI chuyên nghiệp thiết kế bài tập thực hành chất lượng cao cho nền tảng học trực tuyến thông minh.
Hãy thiết kế một bài tập thực hành chi tiết dựa trên bài học thuộc khóa học sau:
- Khóa học: ${courseTitle}
- Bài học: ${lessonTitle}
- Danh mục: ${category || "Khác"}
- Thể loại bài tập tối ưu: ${exerciseType}

Transcript từ video bài học (nếu có):
"""
${transcriptText || "Không tìm thấy phụ đề. Hãy thiết kế bài tập bám sát nhất theo tiêu đề bài học và bối cảnh khóa học."}
"""

Yêu cầu bài tập:
1. Đảm bảo nội dung thực tế, bám sát kiến thức được học.
2. Nếu là "code_challenge", cung cấp starterCode mẫu rõ ràng kèm chỉ dẫn và test cases.
3. Nếu là "quiz", tạo tối thiểu 3 câu hỏi trắc nghiệm bằng tiếng Việt kèm giải thích.
4. Nếu là "qa_writing", tạo tối thiểu 2 câu hỏi tự luận kèm "suggestedAnswer" mẫu chi tiết.
5. Ngôn ngữ: Tiếng Việt (trừ bài tập IELTS/TOEIC thì tiếng Anh nhưng giải thích bằng tiếng Việt).`;

      const exerciseConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Tiêu đề bài tập thực hành sinh động" },
            type: { type: Type.STRING, description: "Kiểu bài tập: 'code_challenge', 'quiz', 'qa_writing'" },
            description: { type: Type.STRING, description: "Mô tả chi tiết yêu cầu bài tập (Markdown)" },
            codeChallenge: {
              type: Type.OBJECT,
              properties: {
                starterCode: { type: Type.STRING },
                language: { type: Type.STRING },
                instructions: { type: Type.STRING },
                expectedOutput: { type: Type.STRING }
              }
            },
            quizQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIdx: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswerIdx", "explanation"]
              }
            },
            writingTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  prompt: { type: Type.STRING },
                  suggestedAnswer: { type: Type.STRING }
                },
                required: ["prompt", "suggestedAnswer"]
              }
            }
          },
          required: ["title", "type", "description"]
        }
      };

      const resultText = await generateWithFallback(ai, systemPrompt, exerciseConfig);
      const parsedResult = JSON.parse(resultText);

      res.json({ success: true, transcriptRetrieved: transcriptSuccess, exercise: parsedResult });
    } catch (geminiErr: any) {
      console.error("[API] Error generating exercise:", geminiErr);
      res.status(500).json({ error: `AI Generation failed: ${geminiErr.message}` });
    }
  });

  // ── /api/review-code ─────────────────────────────────────────────────────────
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
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
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

Hãy phân tích và trả về kết quả JSON. Giải thích rõ lỗi sai (nếu có), nhận xét cấu trúc, độ tối ưu và gợi ý cải tiến bằng tiếng Việt.`;

      const reviewConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            refactoredCode: { type: Type.STRING }
          },
          required: ["passed", "score", "feedback"]
        }
      };

      const resultText = await generateWithFallback(ai, reviewPrompt, reviewConfig);
      res.json(JSON.parse(resultText));
    } catch (err: any) {
      console.error("[API] Error reviewing code:", err);
      res.status(500).json({ error: `AI Review failed: ${err.message}` });
    }
  });

  // ── /api/generate-quiz ────────────────────────────────────────────────────────
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
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      const systemPrompt = `Bạn là một chuyên gia giáo dục EdTech.
Hãy thiết kế ĐÚNG 10 câu hỏi trắc nghiệm chất lượng cao để kiểm tra kiến thức toàn diện của học viên sau khi họ hoàn thành bài học này.
- Tiêu đề bài học: ${title}
- Mô tả bài học/Nội dung: ${description || "Không có mô tả chi tiết"}
- Thử thách/Bài tập đi kèm: ${exercise || "Không có bài tập đi kèm"}

Yêu cầu QUAN TRỌNG:
1. Tạo ĐÚNG 10 câu hỏi trắc nghiệm (Multiple Choice Questions) bằng tiếng Việt — không ít hơn, không nhiều hơn.
2. Mỗi câu hỏi phải có đúng 4 lựa chọn (options).
3. Đặt chỉ số đáp án đúng (correctIndex) từ 0 đến 3.
4. Câu hỏi nên bao phủ: khái niệm cốt lõi, tư duy phân tích, ứng dụng thực tế, và câu hỏi nâng cao/tổng hợp.
5. Mỗi câu hỏi phải rõ ràng, không mơ hồ và có duy nhất một đáp án đúng.`;

      const quizConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER }
            },
            required: ["question", "options", "correctIndex"]
          }
        }
      };

      const resultText = await generateWithFallback(ai, systemPrompt, quizConfig);
      res.json(JSON.parse(resultText));
    } catch (err: any) {
      console.error("[API] Error generating quiz:", err);
      res.status(500).json({ error: `AI Quiz Generation failed: ${err.message}` });
    }
  });

  // ── /api/chat ─────────────────────────────────────────────────────────────────
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
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      const contents = [
        ...(messages || []).map((m: any) => ({
          role: m.role === "model" ? "model" as const : "user" as const,
          parts: [{ text: m.text }]
        })),
        { role: "user" as const, parts: [{ text: userMessage }] }
      ];

      const chatConfig = {
        systemInstruction:
          "Bạn là trợ lý AI thân thiện của trang web Self-Study Hub. Hãy tư vấn về lộ trình học tập, tài liệu và kỹ năng cho sinh viên Việt Nam. Trả lời ngắn gọn, chuyên nghiệp và sử dụng Markdown."
      };

      const resultText = await generateWithFallback(ai, contents, chatConfig);
      res.json({ text: resultText });
    } catch (err: any) {
      console.error("[API] Error in AI Assistant chat:", err);
      res.status(500).json({ error: `AI Assistant Chat failed: ${err.message}` });
    }
  });

  // ── /api/generate-flashcards ──────────────────────────────────────────────────
  app.post("/api/generate-flashcards", async (req, res) => {
    const { topic } = req.body;

    if (!topic || String(topic).trim().length < 2) {
      return res.status(400).json({ error: "Missing or too-short 'topic' field in request body." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      const prompt = `Bạn là một gia sư chuyên nghiệp. Hãy tạo ĐÚNG 10 thẻ ghi nhớ (flashcards) chất lượng cao về chủ đề sau:
"${String(topic).trim()}"

Yêu cầu:
1. Tạo ĐÚNG 10 thẻ — không ít hơn, không nhiều hơn.
2. Mỗi thẻ có "front" (mặt trước — câu hỏi/khái niệm ngắn gọn) và "back" (mặt sau — câu trả lời/giải thích chi tiết, dưới 120 từ).
3. Nội dung phải chính xác, súc tích và bám sát chủ đề.
4. Ngôn ngữ: Tiếng Việt (trừ khi chủ đề yêu cầu tiếng Anh như IELTS, TOEIC).
5. Bao quát từ khái niệm cơ bản đến nâng cao trong cùng chủ đề.`;

      const flashcardConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "Mặt trước: câu hỏi hoặc khái niệm" },
              back:  { type: Type.STRING, description: "Mặt sau: câu trả lời hoặc giải thích" }
            },
            required: ["front", "back"]
          }
        }
      };

      const resultText = await generateWithFallback(ai, prompt, flashcardConfig);
      res.json(JSON.parse(resultText));
    } catch (err: any) {
      console.error("[API] Error generating flashcards:", err);
      res.status(500).json({ error: `Flashcard generation failed: ${err.message}` });
    }
  });

  // ── Vite / Static serving ─────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
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
