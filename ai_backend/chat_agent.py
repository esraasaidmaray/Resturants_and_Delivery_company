import os
import re
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

SYSTEM_INSTRUCTION = """
أنت المساعد الذكي لمطاعم ومأكولات السعودية 🇸🇦 - خبير ومستشار تفاعلي شامل ومتخصص في كافة مطاعم وأكلات وثقافة الطعام في المملكة العربية السعودية.

دورك ومهامك:
1. إجابة أي سؤال يسأله المستخدم بحرية وذكاء كاملين عن مطاعم السعودية، الأطباق الشهيرة، السعرات الحرارية، القيم الغذائية، الجلسات العائلية، الميزانيات، وتجارب الطعام في كل مدن ومناطق المملكة.
2. الإجابة بشكل عام وشامل ودقيق على أي استفسار يخص المأكولات، المكونات، الوصفات، التقييمات، وتاريخ المطاعم في السعودية.
3. الإجابة بأسلوب ودود، مشجع، محترف، ومعبر باللغة العربية مع استخدام الـ Emojis المناسبة 🍣🍕🍚.
4. لا تطلق على نفسك أي اسم محدد، فقط أنت "المساعد الذكي".
5. إذا كان السؤال خارج نطاق المطاعم والأغذية بالكامل (مثل الرياضة، البرمجة، أو السياسة)، اعتذر بلطف ووجه المستخدم لاستكشاف المطاعم.
6. استعن بسياق المطاعم المرفقة في نتائج المستخدم لتقديم إجابات مخصصة، ولديك كامل الحرية للإجابة عن أي مطعم أو طبق آخر في السعودية من معارفك العامة الشاملة.
"""

def generate_smart_nutrition_fallback(messages: List[Dict[str, Any]], recommendations: List[Dict[str, Any]]) -> str:
    user_text = " ".join([m.get("text", "") for m in messages if m.get("sender") == "user"]).lower()
    last_msg = messages[-1].get("text", "").lower() if messages else ""
    top = recommendations[0] if recommendations else None
    top_name = top["restaurant"]["name"] if top else "المطعم"

    # 1. Out of bounds
    if any(w in last_msg for w in ["رياضة", "كورة", "برمجة", "سياسة", "تاريخ", "سيارات"]):
        return "أنا المساعد الذكي المتخصص في مطاعم وأكلات وثقافة الطعام في السعودية 🇸🇦. يسعدني مساعدتك في اختيار أفضل مطعم أو طبق، وحساب السعرات في مدينتك!"

    # 2. Pizza calories & nutrition
    if ("بيتزا" in last_msg or "pizza" in last_msg) and any(w in last_msg for w in ["سعرات", "حرارية", "حراريه", "كالوري", "احسب"]):
        return (
            "تحتوي **بيتزا نابوليتانا** التقليدية (حجم متوسط، حوالي 30 سم) على ما يقارب **800 إلى 950 سعرة حرارية** للبيتزا كاملة 🍕.\n"
            "- للشريحة الواحدة (Slice): تتراوح بين **180 إلى 220 سعرة حرارية**.\n"
            "- تُعد بيتزا نابوليتانا من الخيارات الأخف صحياً مقارنة بأنواع البيتزا الأمريكية لأن عجينتها تعتمد على تخمير طبيعي طويل، صلصة طماطم طازجة، جبنة موزاريلا نقية، والقليل من زيت الزيتون والريحان."
        )

    # 3. Tabbouleh & Salads calories
    if ("تبولة" in user_text or "تبوله" in user_text) and any(w in last_msg for w in ["سعرات", "حرارية", "حراريه", "كالوري", "احسب"]):
        return (
            "يحتوي طبق **التبولة** المتوسط على حوالي **150 إلى 200 سعرة حرارية** فقط 🥗.\n"
            "تعتبر من أفضل الخيارات الصحية لأن معظم مكوناتها بقدونس طازج غني بالألياف ومضادات الأكسدة، مع الليمون وزيت الزيتون الصافي والبرغل الخفيف."
        )

    # 4. General Calories
    if any(w in last_msg for w in ["سعرات", "حرارية", "حراريه", "كالوري", "احسب"]):
        if any(w in user_text for w in ["كبسة", "مندي", "برياني"]):
            return "وجبة الكبسة أو المندي تحتوي تقريباً على **550 إلى 750 سعرة حرارية** للوجبة الواحدة 🍚 (حسب حجم قطعة الدجاج أو اللحم وكمية الأرز)."
        if any(w in user_text for w in ["مشاوي", "كباب", "ستيك", "شيش"]):
            return "طبق المشاوي المشكلة أو الستيك يحتوي تقريباً على **400 إلى 500 سعرة حرارية**، وهو خيار بروتيني غني ومناسب للأنظمة الغذائية 🥩."
        if any(w in user_text for w in ["برجر", "burger"]):
            return "ساندوتش البرجر المشوي يتراوح بين **500 إلى 650 سعرة حرارية** بدون إضافات صوصات دسمة 🍔."
        if any(w in user_text for w in ["سوشي", "sushi"]):
            return "كل 6 قطع سوشي رول تحتوي تقريباً على **250 إلى 350 سعرة حرارية** 🍣."
        return "عادةً تتراوح سعرات السلطات بين 150-250 سعرة، والأطباق الرئيسية المشوية بين 400-550 سعرة، والوجبات الغنية بالأرز واللحوم بين 600-800 سعرة حرارية 📊."

    # 5. Best dish in top restaurant
    if any(w in last_msg for w in ["أفضل طبق", "افضل طبق", "الاول", "الأول", "اطلب", "ترشح"]):
        if top and top.get("dishes"):
            dishes_str = " ، ".join(top.get("dishes", []))
            return f"في مطعم **{top['restaurant']['name']}** (المرشح الأول لك في {top['restaurant']['cityLabel']})، ننصحك بشدة بتجربة الأطباق الأكثر شهرة وطلباً: ({dishes_str}) 🌟."
        return "الأطباق الأكثر طلباً تشتمل على الكبسة والمندي، المشاوي المشكلة، والبيتزا بالحطب. يمكنك اختيار أي مطعم لرؤية قائمته الخاصة!"

    # 6. Specific restaurant Lusin or Piatto
    if "piatto" in user_text or "بياتو" in user_text:
        return "مطعم **بياتو (Piatto)** هو أحد أشهر المطاعم الإيطالية العائلية في السعودية 🇮🇹🍕، يشتهر ببيتزا الحطب النابوليتانا، الباستا الطازجة، الجيلاتو المجاني للأطفال، وجلساته الدافئة المريحة."

    if "lusin" in user_text or "لوسين" in user_text or "لوسيان" in user_text:
        return "مطعم **لوسين (Lusin)** هو مطعم أرمني فاخر وراقي ⭐️ يشتهر بتبولة الأعشاب الرمان، الكبة الأرمنية، والمشاوي المميزة في الرياض وجدة."

    # 7. Families & Seating
    if any(w in last_msg for w in ["عوائل", "عائل", "أطفال", "اطفال", "جلسات", "بارتيشن"]):
        return "معظم المطاعم المرشحة لك توفر جلسات عائلية مريحة مع توفر خيارات الخصوصية والبارتيشن وجلسات الأطفال 👨‍👩‍👧‍👦."

    # 8. General Helpful Assistant fallback
    if top:
        r_name = top["restaurant"]["name"]
        c_label = top["restaurant"]["cityLabel"]
        return f"أهلاً بك! أنا المساعد الذكي لمطاعم السعودية 🇸🇦. يسعدني إجابة استفسارك عن مطعم '{r_name}' في {c_label}، أو حساب السعرات الحرارية لأي طبق ترغب به!"

    return "أهلاً بك! أنا المساعد الذكي لمطاعم السعودية 🇸🇦. اسألني عن أي طبق، مطعم، سعرات حرارية، أو تجربة طعام وسأجيبك فوراً!"

def generate_chat_response(messages: List[Dict[str, Any]], recommendations: List[Dict[str, Any]]) -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    if api_key and api_key != "your_gemini_api_key_here" and HAS_GENAI:
        try:
            client = genai.Client(api_key=api_key)

            context_text = ""
            if recommendations:
                context_text = "\n\n=== المطاعم المرشحة حالياً للمستخدم (RAG Context) ===\n"
                for idx, rec in enumerate(recommendations[:10]):
                    r = rec.get("restaurant", {})
                    context_text += f"{idx+1}. مطعم: {r.get('name')} | المدينة: {r.get('cityLabel')} | المطبخ: {r.get('primaryCuisine')} | التقييم: {r.get('rating')}⭐ | الأطباق: {' · '.join(rec.get('dishes', []))}\n"

            full_system = f"{SYSTEM_INSTRUCTION}\n{context_text}"

            formatted_contents = []
            for m in messages:
                role = "user" if m.get("sender") == "user" else "model"
                formatted_contents.append({"role": role, "parts": [{"text": m.get("text", "")}]})

            MODELS = ["gemini-3.6-flash", "gemini-2.5-pro", "gemini-flash-latest"]
            for model_name in MODELS:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=formatted_contents,
                        config=types.GenerateContentConfig(
                            system_instruction=full_system,
                            temperature=0.7,
                        )
                    )
                    if response.text and len(response.text.strip()) > 0:
                        return response.text
                except Exception as model_err:
                    print(f"Model {model_name} warning: {model_err}, trying next model...")
                    continue
        except Exception as e:
            print(f"Gemini API Exception: {e}")

    # Accurate Smart Response Engine
    return generate_smart_nutrition_fallback(messages, recommendations)
