"use client";

import { useState } from "react";
import type { ChatMessage, Recommendation } from "@/lib/types";

interface AIChatDrawerProps {
  recommendations: Recommendation[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatDrawer({ recommendations, isOpen, onClose }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "ai",
      text: "أهلاً بك في المساعد الذكي المطور بـ Gemini AI! 🤖✨\nأنا هنا لأساعدك في اختيار أفضل المطاعم والأطباق في السعودية، وتوضيح تفاصيل نتائجك الحالية أو استفسارات الحساسية والأنظمة الغذائية.",
      timestamp: "الآن",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  if (!isOpen) return null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query || thinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          recommendations: recommendations,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.reply || "عذراً، حدث خطأ أثناء تلقي الإجابة من الذكاء الاصطناعي.",
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed to fetch AI reply:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "عذراً، يتعذر الاتصال بمساعد الذكاء الاصطناعي حالياً. يرجى التأكد من اتصال الإنترنت أو محاولة الإرسال ثانية.",
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setThinking(false);
    }
  }

  function handleQuickQuestion(q: string) {
    setInput(q);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-palm-950/40 backdrop-blur-sm transition-opacity">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-palm-100 bg-gradient-to-r from-palm-700 to-palm-900 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold shadow-inner">
              🤖
            </div>
            <div>
              <h3 className="font-extrabold text-base">المساعد الذكي (Gemini Agent)</h3>
              <p className="text-xs text-palm-200">استشارات وخدمات مخصصة لمطاعم السعودية 🇸🇦</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition text-white"
          >
            ✕
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="flex gap-2 overflow-x-auto p-3 border-b border-sand-100 bg-sand-50 text-xs no-scrollbar">
          {[
            "إيه أفضل طبق في المطعم الأول؟",
            "مطاعم مناسبة للعوائل في النتائج؟",
            "أفضل مطعم كبسة ومندي في الرياض؟",
            "خيارات خالية من الجلوتين؟",
          ].map((q) => (
            <button
              key={q}
              onClick={() => handleQuickQuestion(q)}
              className="whitespace-nowrap rounded-full border border-palm-200 bg-white px-3 py-1.5 text-palm-800 hover:bg-palm-50 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-palm-600 text-white rounded-br-none shadow-sm"
                    : "bg-sand-100/80 text-palm-950 rounded-bl-none border border-sand-200"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
              </div>
              <span className="mt-1 px-1 text-[10px] text-palm-900/50">{m.timestamp}</span>
            </div>
          ))}

          {thinking && (
            <div className="flex items-center gap-2 text-palm-700 text-sm p-2">
              <span className="h-2 w-2 animate-ping rounded-full bg-palm-600" />
              <span>جاري التفكير عبر Gemini...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="border-t border-sand-200 p-4 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل عن أي مطعم، طبق، أو استفسار غذائي بالسعودية..."
            className="flex-1 rounded-full border border-sand-300 px-4 py-3 text-sm outline-none focus:border-palm-600 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="rounded-full bg-palm-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-palm-700 disabled:opacity-40 transition"
          >
            إرسال
          </button>
        </form>
      </div>
    </div>
  );
}
