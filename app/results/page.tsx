"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AIChatDrawer from "@/components/AIChatDrawer";
import { CITIES } from "@/lib/catalog";
import { recommend } from "@/lib/recommend";
import { loadPreferences } from "@/lib/storage";
import { useRestaurants } from "@/lib/useRestaurants";
import type { Preferences, Recommendation } from "@/lib/types";

function mapsUrl(r: Recommendation["restaurant"]) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `restaurant ${r.name} ${r.cityLabel} Saudi Arabia`,
  )}`;
}

function googleMapsMenuUrl(item: Recommendation) {
  if (item.menuUrl) return item.menuUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `restaurant ${item.restaurant.name} ${item.restaurant.cityLabel} Saudi Arabia menu قائمة الطعام`,
  )}`;
}

export default function ResultsPage() {
  const { restaurants, loading } = useRestaurants();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [sortBy, setSortBy] = useState<"match" | "rating" | "reviews">("match");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Recommendation | null>(null);
  const [menuModalItem, setMenuModalItem] = useState<Recommendation | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [onlyActive, setOnlyActive] = useState(true);

  useEffect(() => {
    setPrefs(loadPreferences());
    const t = setTimeout(() => setAnalyzing(false), 800);
    return () => clearTimeout(t);
  }, []);

  const baseResults = useMemo(() => {
    if (!prefs || restaurants.length === 0) return [];
    return recommend(restaurants, prefs);
  }, [prefs, restaurants]);

  const filteredAndSorted = useMemo(() => {
    let list = [...baseResults];

    if (onlyActive) {
      list = list.filter((item) => item.restaurant.isOpenAndActive !== false);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.restaurant.name.toLowerCase().includes(q) ||
          item.restaurant.primaryCuisine.toLowerCase().includes(q) ||
          item.restaurant.address.toLowerCase().includes(q) ||
          item.dishes.some((d) => d.toLowerCase().includes(q))
      );
    }

    if (sortBy === "rating") {
      list.sort((a, b) => b.restaurant.rating - a.restaurant.rating);
    } else if (sortBy === "reviews") {
      list.sort((a, b) => b.restaurant.reviews - a.restaurant.reviews);
    } else {
      list.sort((a, b) => b.match - a.match);
    }

    return list;
  }, [baseResults, searchQuery, sortBy, onlyActive]);

  if (!prefs) {
    return (
      <main className="grid min-h-screen place-items-center p-6 text-center bg-sand-50">
        <div className="rounded-3xl border border-sand-200 bg-white p-8 shadow-xl max-w-md">
          <span className="text-4xl block mb-3">📝</span>
          <h2 className="text-2xl font-black text-palm-950">لم تقم بإدخال تفضيلاتك بعد</h2>
          <p className="mt-2 text-sm text-palm-900/70">
            يرجى إكمال استبيان الأذواق السريع حتى نتمكن من مطابقة أفضل المطاعم في مدينتك.
          </p>
          <Link
            href="/quiz"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-palm-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-palm-700 transition"
          >
            <span>ابدأ استبيان الأذواق</span>
            <span>✨</span>
          </Link>
        </div>
      </main>
    );
  }

  if (loading || analyzing) {
    return (
      <main className="grid min-h-screen place-items-center p-6 bg-sand-50">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-palm-200 animate-ping opacity-40" />
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-sand-200 border-t-palm-600 shadow-md" />
          </div>
          <h2 className="text-2xl font-black text-palm-950">جاري تحليل تفضيلاتك ومطابقة المطاعم...</h2>
          <p className="text-sm font-medium text-palm-900/70">
            نقوم بفرز +1,800 مطعم في السعودية بناءً على التقييمات، الآراء الموثوقة، ومعايير الحساسية
          </p>
        </div>
      </main>
    );
  }

  const selectedCityObj = CITIES.find((c) => c.id === prefs.cityId);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#fbf8f1_0%,_#f4ead4_100%)] pb-24 pt-8">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Top Title & Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-palm-700 mb-1">
              <span>نتائج الذكاء الاصطناعي 🇸🇦</span>
              <span>•</span>
              <span>{selectedCityObj ? `${selectedCityObj.emoji} ${selectedCityObj.ar}` : "السعودية"}</span>
            </div>
            <h1 className="text-3xl font-black text-palm-950">أفضل المطاعم المطابقة لتفضيلاتك</h1>
            <p className="mt-1 text-sm text-palm-900/70 font-medium">
              عُثر على {baseResults.length} مطعم تم تصنيفها بأعلى نسبة تطابق وأشهر الأطباق والمنيو.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/quiz"
              className="rounded-full border border-palm-200 bg-white px-5 py-2.5 text-xs font-bold text-palm-900 hover:bg-palm-50 shadow-sm transition"
            >
              ⚙️ تعديل الأذواق
            </Link>
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-palm-600 to-palm-800 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-palm-700 hover:to-palm-900 transition"
            >
              <span>💬 استشر المساعد الذكي</span>
            </button>
          </div>
        </div>

        {/* User Choice Tags Summary */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {selectedCityObj && (
            <span className="rounded-full bg-palm-100 px-3 py-1 font-bold text-palm-800">
              📍 {selectedCityObj.ar}
            </span>
          )}
          {prefs.cuisines.map((c) => (
            <span key={c} className="rounded-full bg-sand-200 px-3 py-1 font-bold text-palm-900">
              🍽️ {c}
            </span>
          ))}
          {prefs.allergies.map((a) => (
            <span key={a} className="rounded-full bg-red-100 px-3 py-1 font-bold text-red-800">
              🛡️ حساسية {a}
            </span>
          ))}
          {prefs.diet !== "none" && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800">
              🌱 نظام {prefs.diet}
            </span>
          )}
        </div>

        {/* Toolbar: Search & Sort */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
          <div className="flex flex-1 items-center gap-2 min-w-[240px]">
            <span className="text-palm-900/50">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المطعم، نوع الأكل، أو طبق معين..."
              className="w-full text-sm outline-none text-palm-950 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setOnlyActive((prev) => !prev)}
              className={`rounded-full px-3.5 py-1.5 transition flex items-center gap-1.5 ${
                onlyActive ? "bg-emerald-600 text-white shadow-sm" : "bg-sand-100 text-palm-900 border border-sand-300"
              }`}
            >
              <span>🟢</span>
              <span>المطاعم النشطة المؤكدة فقط</span>
            </button>

            <span className="text-palm-900/30">|</span>

            <span className="text-palm-900/70">ترتيب:</span>
            <button
              onClick={() => setSortBy("match")}
              className={`rounded-full px-3 py-1.5 transition ${
                sortBy === "match" ? "bg-palm-600 text-white shadow-sm" : "bg-sand-100 text-palm-900"
              }`}
            >
              نسبة التطابق %
            </button>
            <button
              onClick={() => setSortBy("rating")}
              className={`rounded-full px-3 py-1.5 transition ${
                sortBy === "rating" ? "bg-palm-600 text-white shadow-sm" : "bg-sand-100 text-palm-900"
              }`}
            >
              التقييم الأعلى ⭐
            </button>
            <button
              onClick={() => setSortBy("reviews")}
              className={`rounded-full px-3 py-1.5 transition ${
                sortBy === "reviews" ? "bg-palm-600 text-white shadow-sm" : "bg-sand-100 text-palm-900"
              }`}
            >
              الأكثر مراجعات 💬
            </button>
          </div>
        </div>

        {/* Results Grid */}
        {filteredAndSorted.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-sand-200 bg-white p-12 text-center">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-xl font-bold text-palm-900">لم نجد مطاعم مطابقة لهذه الفلترة</h3>
            <p className="mt-2 text-sm text-palm-900/70">
              جرب تغيير كلمة البحث أو توسيع أنواع الأكل في الاستبيان.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {filteredAndSorted.map((item, i) => (
              <article
                key={item.restaurant.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-sand-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-palm-500 transition-all duration-300"
              >
                <div>
                  {/* Top Bar: Match Score & Rating */}
                  <div className="flex items-start justify-between gap-4 border-b border-sand-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-palm-950 px-2 py-0.5 text-[11px] font-black text-white">
                          #{i + 1}
                        </span>
                        <span className="rounded-full bg-palm-50 px-3 py-0.5 text-xs font-black text-palm-700 border border-palm-200">
                          {item.match}% نسبة التطابق
                        </span>
                      </div>
                      <h2 className="mt-2 text-2xl font-black text-palm-950 group-hover:text-palm-600 transition-colors">
                        {item.restaurant.name}
                      </h2>
                      <p className="mt-0.5 text-xs font-semibold text-palm-900/70">
                        📍 {item.restaurant.cityLabel} — {item.restaurant.primaryCuisine}
                        {item.restaurant.priceRange ? ` — ${item.restaurant.priceRange} ﷼` : ""}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-palm-50 to-sand-100 px-4 py-3 text-center border border-sand-200 min-w-[75px]">
                      <div className="text-xl font-black text-palm-800 flex items-center justify-center gap-1">
                        <span>{item.restaurant.rating || "—"}</span>
                        <span className="text-gold-500 text-sm">⭐</span>
                      </div>
                      <div className="text-[10px] font-bold text-palm-900/60 mt-0.5">
                        {item.restaurant.reviews} رأي
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <p className="mt-3 text-xs text-palm-900/70 font-medium">
                    {item.restaurant.address}
                  </p>

                  {/* Safety & Reasons Badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.allergySafeFlags.map((flag) => (
                      <span key={flag} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                        {flag}
                      </span>
                    ))}
                    {item.reasons.map((r) => (
                      <span key={r} className="rounded-full bg-sand-100/80 px-2.5 py-1 text-xs font-bold text-palm-900">
                        ✓ {r}
                      </span>
                    ))}
                  </div>

                  {/* Signature Dishes */}
                  {item.dishes.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-sand-50/70 p-3.5 border border-sand-100">
                      <p className="text-xs font-extrabold text-palm-950 flex items-center gap-1.5 mb-1">
                        <span>🔥</span>
                        <span>الأطباق الأكثر طلباً وشهرة:</span>
                      </p>
                      <p className="text-xs font-bold text-palm-800 leading-relaxed">
                        {item.dishes.join("  ·  ")}
                      </p>
                    </div>
                  )}

                  {/* AI Insight Box */}
                  <div className="mt-3 rounded-xl bg-palm-50/60 p-3 border border-palm-100 text-xs text-palm-900/80 italic">
                    💡 {item.aiInsight}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-sand-100 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setMenuModalItem(item)}
                      className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:from-amber-600 hover:to-amber-700 transition"
                    >
                      <span>📖 منيو Google Maps</span>
                    </button>

                    <a
                      href={mapsUrl(item.restaurant)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-palm-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-palm-700 transition"
                    >
                      <span>🗺️ الخريطة</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setSelectedItem(item)}
                    className="rounded-full border border-palm-200 bg-palm-50 px-3.5 py-2 text-xs font-bold text-palm-800 hover:bg-palm-100 transition"
                  >
                    التفاصيل ℹ️
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>

      {/* Floating AI Assistant Trigger */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-3 rounded-full bg-gradient-to-r from-palm-600 via-palm-700 to-palm-900 px-6 py-3.5 text-sm font-extrabold text-white shadow-2xl hover:scale-105 transition-transform"
      >
        <span className="text-xl">🤖</span>
        <span>المساعد الذكي</span>
      </button>

      {/* AI Chat Drawer Component */}
      <AIChatDrawer
        recommendations={baseResults}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Google Maps Menu Modal */}
      {menuModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-palm-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200 border border-sand-200">
            <div className="flex items-start justify-between border-b border-sand-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900 border border-amber-300">
                    📖 منيو وقائمة طعام Google Maps
                  </span>
                  <span className="text-xs text-palm-900/60 font-bold">
                    📍 {menuModalItem.restaurant.cityLabel}
                  </span>
                </div>
                <h3 className="mt-2 text-2xl font-black text-palm-950">
                  قائمة طعام {menuModalItem.restaurant.name}
                </h3>
                <p className="text-xs font-bold text-palm-900/60 mt-0.5">
                  {menuModalItem.restaurant.address}
                </p>
              </div>
              <button
                onClick={() => setMenuModalItem(null)}
                className="rounded-full bg-sand-100 p-2 text-palm-900 hover:bg-sand-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-6">
              {/* Direct Link Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-base flex items-center gap-2">
                    <span>🗺️</span>
                    <span>المنيو الرسمية والصور المحدثة على Google Maps</span>
                  </h4>
                  <p className="text-xs text-amber-100 mt-1 font-medium">
                    انقر لتصفح صور قائمة الطعام والوجبات المرفوعة بواسطة المطعم والزوار مباشرة.
                  </p>
                </div>
                <a
                  href={googleMapsMenuUrl(menuModalItem)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white px-5 py-2.5 text-xs font-black text-amber-950 shadow hover:bg-amber-50 transition whitespace-nowrap"
                >
                  فتح المنيو في Google Maps 🔗
                </a>
              </div>

              {/* Signature Menu Dishes Highlight */}
              <div>
                <h4 className="font-extrabold text-sm text-palm-950 flex items-center gap-2 mb-3">
                  <span>🔥</span>
                  <span>الأطباق والوجبات الأكثر طلباً وتقييماً المأخوذة من آراء Google Maps:</span>
                </h4>

                <div className="grid sm:grid-cols-2 gap-3">
                  {menuModalItem.dishes.map((dish, idx) => (
                    <div
                      key={dish}
                      className="rounded-2xl border border-sand-200 bg-sand-50/70 p-4 shadow-sm hover:border-palm-500 transition"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-palm-950 flex items-center gap-1.5">
                          <span>{["🍛", "🍕", "🥩", "🍱"][idx % 4]}</span>
                          <span>{dish}</span>
                        </span>
                        <span className="rounded-md bg-palm-100 px-2 py-0.5 text-[10px] font-bold text-palm-800">
                          {menuModalItem.restaurant.priceRange ? `${menuModalItem.restaurant.priceRange} ﷼` : "الأكثر إقبالاً"}
                        </span>
                      </div>
                      <p className="text-[11px] text-palm-900/70 font-medium">
                        طبق موصى به بشدة بناءً على أكثر من {menuModalItem.restaurant.reviews} تقييم موثوق للزوار.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Specs */}
              <div className="rounded-2xl bg-palm-50 p-4 border border-palm-100 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-palm-900">
                  <span>نوع المطبخ والتخصص:</span>
                  <span className="text-palm-700">{menuModalItem.restaurant.primaryCuisine}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-palm-900">
                  <span>التقييم الإجمالي على Google Maps:</span>
                  <span className="text-palm-700">{menuModalItem.restaurant.rating} ⭐ ({menuModalItem.restaurant.reviews} رأي)</span>
                </div>
                {menuModalItem.restaurant.hours && (
                  <div className="flex items-center justify-between font-bold text-palm-900">
                    <span>مواعيد العمل:</span>
                    <span className="text-palm-700">{menuModalItem.restaurant.hours}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <a
                  href={googleMapsMenuUrl(menuModalItem)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center rounded-full bg-amber-600 py-3 text-xs font-extrabold text-white shadow-md hover:bg-amber-700 transition"
                >
                  فتح منيو Google Maps الآن 🗺️
                </a>
                <button
                  onClick={() => setMenuModalItem(null)}
                  className="rounded-full border border-sand-300 bg-white px-6 py-3 text-xs font-bold text-palm-900 hover:bg-sand-50 transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Restaurant Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-palm-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-sand-100 pb-4">
              <div>
                <span className="rounded-full bg-palm-100 px-3 py-1 text-xs font-extrabold text-palm-800">
                  {selectedItem.match}% تطابق مع تفضيلاتك
                </span>
                <h3 className="mt-2 text-2xl font-black text-palm-950">{selectedItem.restaurant.name}</h3>
                <p className="text-xs font-bold text-palm-900/60">{selectedItem.restaurant.address}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-full bg-sand-100 p-2 text-palm-900 hover:bg-sand-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-sand-50 p-3 border border-sand-100">
                  <span className="block text-palm-900/60 font-bold mb-1">التقييم والمراجعات</span>
                  <span className="text-lg font-black text-palm-900">{selectedItem.restaurant.rating} ⭐ ({selectedItem.restaurant.reviews} رأي)</span>
                </div>
                <div className="rounded-2xl bg-sand-50 p-3 border border-sand-100">
                  <span className="block text-palm-900/60 font-bold mb-1">نوع المطعم والأسعار</span>
                  <span className="text-sm font-extrabold text-palm-900">{selectedItem.restaurant.primaryCuisine}</span>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-palm-900 mb-2">🔥 الأطباق الأشهر الموصى بها:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.dishes.map((dish) => (
                    <span key={dish} className="rounded-xl bg-palm-50 px-3 py-1.5 text-xs font-bold text-palm-800 border border-palm-200">
                      {dish}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-palm-900 mb-2">💡 تحليل الذكاء الاصطناعي:</h4>
                <p className="text-xs text-palm-900/80 leading-relaxed bg-sand-50 p-3 rounded-2xl border border-sand-100 font-medium">
                  {selectedItem.aiInsight}
                </p>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setMenuModalItem(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 text-center rounded-full bg-amber-500 py-3 text-xs font-black text-white shadow-md hover:bg-amber-600 transition"
                >
                  📖 منيو Google Maps
                </button>
                <a
                  href={mapsUrl(selectedItem.restaurant)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center rounded-full bg-palm-600 py-3 text-xs font-bold text-white shadow-md hover:bg-palm-700 transition"
                >
                  الخريطة 🗺️
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
