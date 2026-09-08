import Link from "next/link";
import { CITIES } from "@/lib/catalog";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#dceee3_0%,_#fbf8f1_50%,_#f4ead4_100%)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-palm-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-palm-800 shadow-sm backdrop-blur">
                <span className="flex h-2 w-2 rounded-full bg-palm-600 animate-pulse" />
                <span>المنصة الذكية الأولى لتوصية المطاعم في السعودية 🇸🇦</span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-palm-950 md:text-5xl lg:text-6xl">
                مطاعم تناسب تفضيلاتك، <br />
                <span className="bg-gradient-to-r from-palm-600 via-palm-700 to-sand-400 bg-clip-text text-transparent">
                  قريبة منك، بالأطباق الأشهر.
                </span>
              </h1>

              <p className="text-lg leading-relaxed text-palm-900/80 max-w-2xl font-medium">
                سواء كنت مقيماً في المملكة أو زائراً، النظام الذكي يستوعب تفضيلاتك: نوع الأكل المفضل، قيود الحساسية، ميزانيتك، والمكان، ليرشح لك قائمة مطاعم دقيقة بأعلى التقييمات وأشهر الأطباق المطلوبة.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/quiz"
                  className="flex items-center gap-3 rounded-full bg-gradient-to-r from-palm-600 to-palm-800 px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-palm-600/30 hover:from-palm-700 hover:to-palm-900 transition-all hover:scale-105"
                >
                  <span>ابدأ استبيان الأذواق</span>
                  <span className="text-xl">✨</span>
                </Link>

                <a
                  href="#how-it-works"
                  className="rounded-full border border-palm-200 bg-white/80 px-7 py-4 text-base font-bold text-palm-900 hover:bg-white transition"
                >
                  كيف يعمل النظام؟ 💡
                </a>
              </div>

              {/* Live Data Badge */}
              <div className="pt-6 flex flex-wrap items-center gap-6 border-t border-palm-900/10">
                <div>
                  <p className="text-2xl font-black text-palm-900">+1,800</p>
                  <p className="text-xs font-semibold text-palm-900/60">مطعم حقيقي في المملكة</p>
                </div>
                <div className="h-8 w-px bg-palm-900/10" />
                <div>
                  <p className="text-2xl font-black text-palm-900">100%</p>
                  <p className="text-xs font-semibold text-palm-900/60">حماية من الحساسية والممنوعات</p>
                </div>
                <div className="h-8 w-px bg-palm-900/10" />
                <div>
                  <p className="text-2xl font-black text-palm-900">AI ⭐</p>
                  <p className="text-xs font-semibold text-palm-900/60">تحليل المراجعات والأطباق</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-palm-500 to-sand-400 opacity-30 blur-xl animate-pulse" />
              
              <div className="relative rounded-3xl border border-white/60 bg-white/90 p-7 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-sand-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍣</span>
                    <div>
                      <h3 className="font-extrabold text-palm-900 text-lg">مطعم تاكي الياباني</h3>
                      <p className="text-xs text-palm-900/60">الخبر — طريق الأمير مساعد</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-palm-50 px-3 py-1.5 text-center">
                    <span className="text-lg font-black text-palm-700">98%</span>
                    <span className="block text-[9px] font-bold text-palm-900/70">نسبة التطابق</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-full bg-sand-100 px-3 py-1 font-bold text-palm-800">
                      قريب منك في الخبر 🌉
                    </span>
                    <span className="rounded-full bg-palm-100/70 px-3 py-1 font-bold text-palm-800">
                      تقييم 5.0 ⭐ (59 مراجعة)
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800">
                      خالٍ من الجلوتين 🌾
                    </span>
                  </div>

                  <div className="rounded-2xl bg-sand-50 p-4 border border-sand-100">
                    <p className="text-xs font-bold text-palm-900 mb-1">🔥 الأطباق الأكثر طلباً وشهرة:</p>
                    <p className="text-xs text-palm-900/80 font-semibold">
                      سوشي رول كاليفورنيا · ساشيمي سالمون · رامن دجاج · تمبورا روبيان
                    </p>
                  </div>

                  <div className="text-xs text-palm-900/70 italic bg-palm-50/60 p-3 rounded-xl border border-palm-100">
                    &quot;تم اختيار هذا المطعم لأنه يطابق رغبتك في الأكل الآسيوي السريع، وبدرجة أمان عالية من الحساسية.&quot;
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Coverage Cities Grid */}
      <section className="border-y border-sand-200 bg-white/70 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs font-black uppercase tracking-wider text-palm-700 mb-3">
            تغطية شاملة لأهم مدن السعودية
          </p>
          <h2 className="text-center text-2xl font-black text-palm-900 mb-8">
            تغطية المطاعم في مناطق المملكة الرئيسية
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {CITIES.filter((c) => c.id !== "eastern").map((city) => (
              <Link
                key={city.id}
                href="/quiz"
                className="group rounded-2xl border border-sand-200 bg-white p-4 shadow-sm hover:border-palm-500 hover:shadow-md transition"
              >
                <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">
                  {city.emoji}
                </span>
                <span className="text-sm font-extrabold text-palm-900">{city.ar}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="rounded-full bg-sand-200 px-3 py-1 text-xs font-bold text-palm-800">
              خطوات سهلة وسريعة ⚡
            </span>
            <h2 className="text-3xl font-black text-palm-950 mt-3">كيف تجد المطعم المثالي؟</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: "📝",
                title: "استبيان الأذواق والحساسية",
                desc: "تحديد المدينة، المأكولات المفضلة، أي حساسية (جلوتين، مكسرات، إلخ)، الميزانية، والمناسبات.",
              },
              {
                step: "02",
                icon: "🧠",
                title: "تحليل الذكاء الاصطناعي",
                desc: "مطابقة رغباتك مع قاعدة البيانات، حساب نسبة القرب والتقييمات وثقل المراجعات الموثوقة.",
              },
              {
                step: "03",
                icon: "🍽️",
                title: "قائمة مطاعم بأشهر الأطباق",
                desc: "استعراض المطاعم الأنسب مع الأطباق الأكثر طلباً ورابط الموقع المباشر والاتصال وسؤال المساعد الذكي.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-3xl border border-sand-200 bg-white p-8 shadow-sm hover:shadow-lg transition group"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-3xl font-black text-sand-300 group-hover:text-palm-600 transition">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-palm-900 mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed text-palm-900/70 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-full bg-palm-600 px-9 py-4 text-base font-extrabold text-white shadow-lg hover:bg-palm-700 transition"
            >
              <span>ابدأ التجربة الآن</span>
              <span>🚀</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

