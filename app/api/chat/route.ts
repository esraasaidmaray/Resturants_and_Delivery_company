import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, Recommendation } from "@/lib/types";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:8000";

const SYSTEM_INSTRUCTION = `
أنت المساعد الذكي لمطاعم السعودية 🇸🇦 - خبير ومستشار تفاعلي شامل متخصص في كافة مطاعم ومأكولات وثقافة الطعام في المملكة العربية السعودية.

التعليمات وضوابط الإجابة:
1. نطاقك هو المطاعم، الأطباق، السعرات الحرارية، التقييمات، تجارب الأكل، الجلسات العائلية، مسببات الحساسية، والأنظمة الغذائية في السعودية.
2. إذا قام المستخدم بسؤالك عن أي موضوع خارج نطاق المطاعم والأكل في السعودية (مثل الرياضة، البرمجة، السياسة)، اعتذر بلطف ووجهه لاستكشاف مطاعم السعودية. 
   مثال الرفض اللبق: "أنا المساعد الذكي المتخصص في مطاعم وأكلات السعودية 🇸🇦. يسعدني مساعدتك في اختيار أفضل مطعم أو طبق في مدينتك!"
3. إذا كان سؤال المستخدم يتعلق بالأنظمة الغذائية أو الحساسية (مثل الجلوتين أو النباتيين)، أعطه نصائح وتوصيات دقيقة للمطاعم المطابقة لشروطه.
4. استعن بسياق المطاعم المرشحة الحالية للمستخدم والمرفقة مع هذا الطلب للإجابة بدقة عن أسماء المطاعم الموصى بها، أسباب ترشيحها، التقييمات، والأطباق الأكثر طلباً.
5. أجب دائماً باللغة العربية بأسلوب ودود، مشجع، محترف، ومعبر مع استخدام الـ Emojis المناسبة 🍣🍕🍚.
`;

function buildRestaurantContext(recommendations: Recommendation[]): string {
  if (!recommendations || recommendations.length === 0) {
    return "\n(لا توجد مطاعم مرشحة حالياً في شاشة المستخدم، أجب عن أسئلته العامة المتعلقة بمطاعم السعودية).\n";
  }

  let text = "\n\n=== المطاعم المرشحة حالياً للمستخدم بناءً على استبيانه ===\n";
  recommendations.slice(0, 10).forEach((rec, idx) => {
    text += `${idx + 1}. مطعم: ${rec.restaurant.name}\n`;
    text += `   - المدينة والمنطقة: ${rec.restaurant.cityLabel} (${rec.restaurant.address})\n`;
    text += `   - نوع المطبخ: ${rec.restaurant.primaryCuisine}\n`;
    text += `   - التقييم والمراجعات: ${rec.restaurant.rating} ⭐ (${rec.restaurant.reviews} رأي)\n`;
    text += `   - نسبة التطابق: ${rec.match}%\n`;
    text += `   - أسباب الترشيح: ${rec.reasons.join(" · ")}\n`;
    text += `   - الأطباق الأكثر طلباً وشهرة: ${rec.dishes.join(" · ")}\n`;
    text += `   - الأمان والحساسية: ${rec.allergySafeFlags.join(" · ") || "مطابق للمعايير العامة"}\n`;
    if (rec.restaurant.phone) text += `   - رقم التواصل: ${rec.restaurant.phone}\n`;
    text += "\n";
  });

  return text;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const recommendations: Recommendation[] = body.recommendations || [];

    if (messages.length === 0) {
      return NextResponse.json({ error: "لا توجد رسائل مدخلة" }, { status: 400 });
    }

    // Attempt calling Python AI Backend first
    try {
      const pyRes = await fetch(`${PYTHON_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, recommendations }),
        signal: AbortSignal.timeout(25000), // 25 second timeout for Gemini
      });

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        if (pyData.reply) {
          return NextResponse.json({
            reply: pyData.reply,
            engine: pyData.engine || "Python FastAPI Agent 🐍",
            success: true,
          });
        }
      }
    } catch (pyErr) {
      console.warn("Python AI Backend unavailable or timed out, falling back to Next.js engine:", pyErr);
    }

    // Node.js fallback if Python Backend is not running
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      const lastMsg = messages[messages.length - 1].text.toLowerCase();
      const top = recommendations[0];

      let fallbackReply = "";
      if (lastMsg.includes("طبق") || lastMsg.includes("أكل") || lastMsg.includes("اطلب")) {
        if (top) {
          fallbackReply = `ننصحك في "${top.restaurant.name}" بتجربة الأطباق الأكثر طلباً: (${top.dishes.join("، ")}). ✨`;
        } else {
          fallbackReply = "نوصي بتجربة الأطباق الأكثر طلباً في نتائجك مثل الكبسة، السوشي، والبيتزا بالحطب!";
        }
      } else if (lastMsg.includes("رياضة") || lastMsg.includes("كورة") || lastMsg.includes("برمجة") || lastMsg.includes("سياسة")) {
        fallbackReply = "أنا المساعد الذكي المتخصص في مطاعم وأكلات السعودية 🇸🇦. يسعدني مساعدتك في اختيار أفضل مطعم أو طبق في مدينتك!";
      } else if (top) {
        fallbackReply = `المرشح الأول لك هو مطعم "${top.restaurant.name}" في ${top.restaurant.cityLabel} بنسبة تطابق ${top.match}%. سبب الترشيح: ${top.reasons.join(" · ")}. 🤖`;
      } else {
        fallbackReply = "أهلاً بك! يمكنك سؤالي عن تفاصيل المطاعم والأطباق في السعودية.";
      }

      return NextResponse.json({
        reply: fallbackReply,
        isFallback: true,
        engine: "Next.js Local Engine",
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const contents = messages.map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const contextText = buildRestaurantContext(recommendations);
    const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n${contextText}`;

    const candidateModels = ["gemini-3.6-flash", "gemini-2.5-pro", "gemini-flash-latest"];
    let lastError: any = null;
    let replyText = "";

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature: 0.7,
          },
        });
        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (mErr: any) {
        lastError = mErr;
        console.warn(`Model ${modelName} failed, attempting next model:`, mErr?.message);
      }
    }

    if (!replyText) {
      throw lastError || new Error("All Gemini models were unavailable.");
    }

    return NextResponse.json({ reply: replyText, engine: "Gemini AI Agent", success: true });
  } catch (err: any) {
    console.error("Chat API Error:", err);
    return NextResponse.json(
      {
        reply: "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي. يرجى إعادة محاولة إرسال السؤال.",
        error: err?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
