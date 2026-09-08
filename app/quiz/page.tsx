"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, CRAVINGS, CUISINES, FAVORITE_DISHES } from "@/lib/catalog";
import { emptyPreferences, savePreferences } from "@/lib/storage";
import type { Allergy, Budget, Diet, Occasion, Preferences } from "@/lib/types";

const STEPS = [
  { label: "مكانك في السعودية", icon: "📍", desc: "اختر المدينة لرؤية مطاعم قريبة منك" },
  { label: "المأكولات والمطابخ المفضلة", icon: "🍽️", desc: "اختر المطابخ التي تميل لها" },
  { label: "الأمان الغذائي والحساسية", icon: "🛡️", desc: "حدد أي قيود أو حساسية لتجنبها" },
  { label: "الأكلات المفضلة والرغبة الخاصة", icon: "❤️", desc: "اختر أطباقك المفضلة واكتب أي رغبة بالكلمات" },
  { label: "نفسك في إيه دلوقتي؟", icon: "🤤", desc: "اختر حالتك المزاجية للوجبة" },
  { label: "الميزانية والمناسبة", icon: "💰", desc: "تحديد متوسط التكلفة وطبيعة الجلسة" },
];

function Chip({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`chip ${on ? "chip-on" : "chip-idle"}`}>
      {children}
    </button>
  );
}

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Preferences>(emptyPreferences);

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(prefs.cityId);
    if (step === 1) return prefs.cuisines.length > 0;
    if (step === 4) return Boolean(prefs.craving);
    return true;
  }, [prefs, step]);

  function toggleCuisine(id: string) {
    setPrefs((p) => ({
      ...p,
      cuisines: p.cuisines.includes(id)
        ? p.cuisines.filter((x) => x !== id)
        : [...p.cuisines, id],
    }));
  }

  function toggleAllergy(id: Allergy) {
    setPrefs((p) => ({
      ...p,
      allergies: p.allergies.includes(id)
        ? p.allergies.filter((x) => x !== id)
        : [...p.allergies, id],
    }));
  }

  function toggleFavorite(name: string) {
    setPrefs((p) => ({
      ...p,
      favorites: p.favorites.includes(name)
        ? p.favorites.filter((x) => x !== name)
        : [...p.favorites, name],
    }));
  }

  function finish() {
    savePreferences(prefs);
    router.push("/results");
  }

  const currentStepInfo = STEPS[step];

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#fbf8f1_0%,_#f4ead4_100%)] pb-16 pt-8">
      <div className="mx-auto max-w-3xl px-6">
        {/* Stepper Indicator */}
        <div className="flex items-center justify-between text-xs font-extrabold text-palm-700 mb-2">
          <span>خطوة {step + 1} من {STEPS.length}</span>
          <span>{currentStepInfo.icon} {currentStepInfo.label}</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 overflow-hidden rounded-full bg-sand-200/80 p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-palm-500 via-palm-600 to-palm-800 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header Title */}
        <div className="mt-8">
          <h1 className="text-3xl font-black text-palm-950 flex items-center gap-3">
            <span>{currentStepInfo.icon}</span>
            <span>{currentStepInfo.label}</span>
          </h1>
          <p className="mt-2 text-palm-900/70 font-medium text-base">{currentStepInfo.desc}</p>
        </div>

        {/* Card Body */}
        <div className="mt-8 rounded-3xl border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur-md">
          {step === 0 && (
            <div>
              <p className="mb-5 text-sm font-bold text-palm-900/80">اختر مدينتك الحالية أو وجهتك الجغرافية:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CITIES.map((city) => (
                  <Chip
                    key={city.id}
                    on={prefs.cityId === city.id}
                    onClick={() => setPrefs((p) => ({ ...p, cityId: city.id }))}
                  >
                    <span className="text-xl">{city.emoji}</span>
                    <span>{city.ar}</span>
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="mb-5 text-sm font-bold text-palm-900/80">اختر جميع المأكولات والمطابخ المحببة لديك (يمكنك اختيار أكثر من نوع):</p>
              <div className="flex flex-wrap gap-2.5">
                {CUISINES.map((c) => (
                  <Chip key={c.id} on={prefs.cuisines.includes(c.id)} onClick={() => toggleCuisine(c.id)}>
                    <span className="text-lg">{c.emoji}</span>
                    <span>{c.ar}</span>
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <p className="mb-3 font-bold text-palm-900 flex items-center gap-2">
                  <span>⚠️</span> هل تعاني من أي حساسية؟ (سيتم استبعاد المطاعم المخالفة فوراً):
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {(
                    [
                      ["nuts", "مكسرات 🥜"],
                      ["gluten", "جلوتين 🌾"],
                      ["dairy", "ألبان والحليب 🥛"],
                      ["seafood", "مأكولات بحرية 🦐"],
                      ["eggs", "بيض 🥚"],
                      ["spicy", "أكل حار 🌶️"],
                    ] as [Allergy, string][]
                  ).map(([id, label]) => (
                    <Chip key={id} on={prefs.allergies.includes(id)} onClick={() => toggleAllergy(id)}>
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="border-t border-sand-100 pt-6">
                <p className="mb-3 font-bold text-palm-900 flex items-center gap-2">
                  <span>🌱</span> نظامك الغذائي المتبع:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {(
                    [
                      ["none", "عادي / متنوع 🍖"],
                      ["halal", "حلال معتمد 🕌"],
                      ["vegetarian", "نباتي 🥗"],
                      ["vegan", "نباتي صرف 🥑"],
                    ] as [Diet, string][]
                  ).map(([id, label]) => (
                    <Chip
                      key={id}
                      on={prefs.diet === id}
                      onClick={() => setPrefs((p) => ({ ...p, diet: id }))}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-4 text-sm font-bold text-palm-900/80">اختر من الأطباق الشائعة أو اكتب وصفاً خاصاً لرغبتك:</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {FAVORITE_DISHES.map((d) => (
                  <Chip key={d} on={prefs.favorites.includes(d)} onClick={() => toggleFavorite(d)}>
                    {d}
                  </Chip>
                ))}
              </div>

              <div className="rounded-2xl border border-sand-200 bg-sand-50/50 p-4">
                <label className="mb-2 block text-xs font-bold text-palm-900">
                  اكتب رغبتك بالكلمات (اختياري - تحليل ذكي):
                </label>
                <textarea
                  value={prefs.freeText}
                  onChange={(e) => setPrefs((p) => ({ ...p, freeText: e.target.value }))}
                  placeholder="مثال: بحب كبسة دجاج شواية تكون طرية وممش حارة، ومكان فيه هدوء وجلسات عائلية مريحة..."
                  className="min-h-28 w-full rounded-xl border border-sand-200 bg-white p-4 text-sm font-medium outline-none focus:border-palm-600 transition"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="mb-5 text-sm font-bold text-palm-900/80">ما هي أكثر وجبة أو حالة مزاجية تشتهيها الآن؟</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {CRAVINGS.map((c) => (
                  <Chip
                    key={c.id}
                    on={prefs.craving === c.id}
                    onClick={() => setPrefs((p) => ({ ...p, craving: c.id }))}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    <span>{c.ar}</span>
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div>
                <p className="mb-4 font-bold text-palm-900 flex items-center gap-2">
                  <span>💵</span> الميزانية التقريبية للفرد:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      ["any", "مش فارقة ⚖️"],
                      ["budget", "اقتصادي 💵 (أقل من 50 ﷼)"],
                      ["mid", "متوسط 💳 (50 - 150 ﷼)"],
                      ["fine", "فاخر 💎 (+150 ﷼)"],
                    ] as [Budget, string][]
                  ).map(([id, label]) => (
                    <Chip
                      key={id}
                      on={prefs.budget === id}
                      onClick={() => setPrefs((p) => ({ ...p, budget: id }))}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="border-t border-sand-100 pt-6">
                <p className="mb-4 font-bold text-palm-900 flex items-center gap-2">
                  <span>🎉</span> طبيعة الجلسة أو المناسبة:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {(
                    [
                      ["any", "عادي 🍽️"],
                      ["quick", "وجبة سريعة ⚡"],
                      ["family", "تجمع عائلي 👨‍👩‍👧‍👦"],
                      ["friends", "سهرة أصدقاء 🤝"],
                      ["date", "خروج خاص ومميز 🕯️"],
                      ["business", "لقاء عمل 💼"],
                    ] as [Occasion, string][]
                  ).map(([id, label]) => (
                    <Chip
                      key={id}
                      on={prefs.occasion === id}
                      onClick={() => setPrefs((p) => ({ ...p, occasion: id }))}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stepper Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="rounded-full border border-palm-200 bg-white px-7 py-3 text-sm font-bold text-palm-800 shadow-sm hover:bg-palm-50 disabled:opacity-30 transition"
          >
            ← السابق
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-palm-600 to-palm-800 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg hover:from-palm-700 hover:to-palm-900 disabled:opacity-40 transition"
            >
              <span>التالي</span>
              <span>→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-palm-600 via-palm-700 to-sand-400 px-9 py-4 text-base font-black text-white shadow-xl hover:scale-105 transition"
            >
              <span>حلّل واستخرج المطاعم</span>
              <span>🚀</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

