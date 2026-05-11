import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
import { cn } from "../lib/utils";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "model", text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({
            role: m.role === "model" ? "model" as const : "user" as const,
            parts: [{ text: m.text }]
          })),
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "Bạn là trợ lý AI thân thiện của trang web Self-Study Hub. Hãy tư vấn về lộ trình học tập, tài liệu và kỹ năng cho sinh viên Việt Nam. Trả lời ngắn gọn, chuyên nghiệp và sử dụng Markdown.",
        }
      });

      const botResponse = response.text || "Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại nhé!";
      setMessages(prev => [...prev, { role: "model", text: botResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "model", text: "Có lỗi xảy ra khi kết nối với bộ não AI của mình. Hãy kiểm tra lại kết nối mạng nhé!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-3d z-50 transition-all hover:bg-emerald-700"
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-[90vw] max-w-[400px] h-[60vh] max-h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-3d z-50 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold">Trợ Lý AI Tự Học</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                <span className="text-xs font-medium opacity-80">Trực tuyến</span>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900"
            >
              {messages.length === 0 && (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                  <Bot size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Chào bạn! Mình có thể giúp gì cho quá trình tự học của bạn hôm nay?</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === "user" 
                      ? "bg-emerald-600 text-white rounded-br-none" 
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none"
                  )}>
                    <div className="prose prose-sm prose-emerald max-w-none dark:prose-invert">
                      <ReactMarkdown>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto items-start max-w-[85%] flex gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none shadow-sm animate-pulse">
                  <Loader2 size={16} className="animate-spin text-emerald-600" />
                  <span className="text-sm text-slate-400">AI đang suy nghĩ...</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
