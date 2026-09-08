import { CITIES, CRAVINGS, CUISINES } from "./catalog";
import { signatureDishes } from "./dishes";
import type { Preferences, Recommendation, Restaurant } from "./types";

function haystack(r: Restaurant): string {
  return `${r.name} ${r.cuisines.join(" ")} ${r.primaryCuisine} ${r.address} ${r.location}`.toLowerCase();
}

function cuisineKeywords(ids: string[]): string[] {
  return ids.flatMap((id) => CUISINES.find((c) => c.id === id)?.keywords ?? []);
}

function hasAllergyConflict(r: Restaurant, prefs: Preferences): boolean {
  const text = haystack(r);
  if (prefs.allergies.includes("seafood") && (text.includes("seafood") || text.includes("sushi"))) {
    return true;
  }
  if (prefs.diet === "vegetarian" && (text.includes("steakhouse") || text.includes("barbecue"))) {
    return !text.includes("vegetarian");
  }
  if (prefs.diet === "vegan" && !text.includes("vegan")) {
    return text.includes("steakhouse") || text.includes("barbecue") || text.includes("seafood");
  }
  return false;
}

function qualityScore(r: Restaurant): number {
  const ratingPart = (Math.max(r.rating, 0) / 5) * 18;
  const reviewPart = Math.min(Math.log10(r.reviews + 1) / Math.log10(400), 1) * 14;
  return ratingPart + reviewPart;
}

function buildInsight(r: Restaurant, match: number, reasons: string[]): string {
  const topReason = reasons[0] || "توصية مخصصة";
  return `اخترنا لك ${r.name} بنسبة تطابق ${match}% لأجل: ${topReason}، وبناءً على تقييمه المرتفع (${r.rating} من 5) مع أكثر من ${r.reviews} مراجعة موثوقة في ${r.cityLabel}.`;
}

export function recommend(restaurants: Restaurant[], prefs: Preferences): Recommendation[] {
  const city = CITIES.find((c) => c.id === prefs.cityId);
  const selectedKeywords = cuisineKeywords(prefs.cuisines);
  const craving = CRAVINGS.find((c) => c.id === prefs.craving);
  const free = `${prefs.freeText} ${prefs.favorites.join(" ")}`.toLowerCase();

  const scored: Recommendation[] = [];

  for (const restaurant of restaurants) {
    if (hasAllergyConflict(restaurant, prefs)) continue;

    const reasons: string[] = [];
    const safeFlags: string[] = [];
    let score = 10;
    const text = haystack(restaurant);

    if (city) {
      const sameCity = restaurant.cityId === city.id || city.id === "eastern";
      const nearby = city.nearby.includes(restaurant.cityId);
      const sameRegion = restaurant.region === city.region;
      if (city.id !== "eastern" && sameCity) {
        score += 36;
        reasons.push(`قريب منك في ${restaurant.cityLabel}`);
      } else if (nearby) {
        score += 18;
        reasons.push(`في مدينة قريبة (${restaurant.cityLabel})`);
      } else if (sameRegion) {
        score += 10;
      } else {
        continue;
      }
    }

    let cuisineHits = 0;
    for (const kw of selectedKeywords) {
      if (text.includes(kw)) cuisineHits += 1;
    }
    if (cuisineHits > 0) {
      score += Math.min(28, 12 + cuisineHits * 6);
      reasons.push("نوع الأكل مطابق تماماً لتفضيلك");
    }

    if (craving && craving.keywords.some((k) => text.includes(k))) {
      score += 16;
      reasons.push("يناسب ما تشتهيه الآن");
    }

    if (prefs.diet === "vegetarian" && text.includes("vegetarian")) {
      score += 10;
      reasons.push("خيارات نباتية متوفرة");
      safeFlags.push("خيارات نباتية 🥗");
    }
    if (prefs.diet === "vegan" && text.includes("vegan")) {
      score += 12;
      reasons.push("خيارات نباتية صرف");
      safeFlags.push("نباتي صرف 🥑");
    }
    if (prefs.allergies.includes("gluten") && text.includes("gluten free")) {
      score += 10;
      reasons.push("خيارات خالية من الجلوتين");
      safeFlags.push("خالٍ من الجلوتين 🌾");
    }
    if (text.includes("halal")) {
      score += 4;
      safeFlags.push("حلال معتمد 🕌");
    }

    const favoriteHits = prefs.favorites.filter((f) => {
      const map: Record<string, string[]> = {
        "كبسة دجاج": ["middle eastern", "arabic", "saudi"],
        "مندي لحم": ["middle eastern", "arabic"],
        "شاورما صاج": ["lebanese", "fast food", "middle eastern"],
        "سوشي رول": ["sushi", "japanese"],
        "بيتزا نابوليتانا": ["pizza", "italian"],
        "باستا تروفل": ["italian"],
        "برجر لحم مشوي": ["american", "fast food", "burger"],
        "ستيك ريب آي": ["steakhouse", "american", "barbecue"],
        "روبيان جامبو": ["seafood"],
        "برياني دجاج": ["indian", "pakistani"],
        "طاجن بحري": ["seafood", "moroccan"],
        "كنافة نابلسية": ["lebanese", "middle eastern", "cafe"],
        "مشاوي مشكلة": ["grill", "barbecue", "lebanese"],
        "حمص وتبولة": ["lebanese", "vegetarian"],
      };
      return (map[f] ?? []).some((k) => text.includes(k));
    });
    if (favoriteHits.length > 0) {
      score += Math.min(14, favoriteHits.length * 5);
      reasons.push("يقدم أطباقك المفضلة");
    }

    if (free.includes("سوشي") && text.includes("sushi")) score += 8;
    if (free.includes("كبسة") && (text.includes("middle eastern") || text.includes("arabic"))) score += 8;
    if (free.includes("حار") && (text.includes("indian") || text.includes("mexican"))) score += 6;
    if (free.includes("هدوء") || free.includes("رومانسي")) score += 4;

    if (prefs.budget !== "any" && restaurant.priceBand === prefs.budget) {
      score += 8;
      reasons.push("تناسب ميزانيتك المقترحة");
    }

    if (prefs.occasion === "quick" && text.includes("fast food")) score += 6;
    if (prefs.occasion === "date" && restaurant.rating >= 4.5 && restaurant.priceBand === "fine") {
      score += 6;
      reasons.push("أجواء مميزة للمناسبات الخاصة");
    }
    if (prefs.occasion === "family" && restaurant.reviews > 80) score += 4;

    score += qualityScore(restaurant);
    if (restaurant.rating >= 4.5 && restaurant.reviews >= 50) {
      reasons.push(`تقييم ممتازة (${restaurant.rating}⭐) من ${restaurant.reviews} مراجعة`);
    } else if (restaurant.rating >= 4) {
      reasons.push(`تقييم مرضي (${restaurant.rating}⭐)`);
    }

    if (reasons.length === 0) continue;

    const match = Math.max(60, Math.min(99, Math.round(score)));
    const cleanReasons = [...new Set(reasons)].slice(0, 4);

    scored.push({
      restaurant,
      match,
      reasons: cleanReasons,
      dishes: signatureDishes(restaurant.cuisines, prefs.craving),
      aiInsight: buildInsight(restaurant, match, cleanReasons),
      allergySafeFlags: safeFlags,
      menuUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `restaurant ${restaurant.name} ${restaurant.cityLabel} Saudi Arabia menu قائمة الطعام`
      )}`,
    });
  }

  return scored
    .sort((a, b) => {
      if (b.match !== a.match) return b.match - a.match;
      if (b.restaurant.reviews !== a.restaurant.reviews) {
        return b.restaurant.reviews - a.restaurant.reviews;
      }
      return b.restaurant.rating - a.restaurant.rating;
    })
    .slice(0, 16);
}

