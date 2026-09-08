export const CUISINES: { id: string; ar: string; emoji: string; keywords: string[] }[] = [
  { id: "saudi", ar: "سعودي وعربي 🇸🇦", emoji: "🍚", keywords: ["middle eastern", "arabic", "saudi"] },
  { id: "lebanese", ar: "لبناني وشامي 🇱🇧", emoji: "🧆", keywords: ["lebanese", "syrian"] },
  { id: "egyptian", ar: "مصري 🇪🇬", emoji: "🍲", keywords: ["egyptian"] },
  { id: "turkish", ar: "تركي 🇹🇷", emoji: "🍢", keywords: ["turkish"] },
  { id: "moroccan", ar: "مغربي 🇲🇦", emoji: "🍲", keywords: ["moroccan"] },
  { id: "indian", ar: "هندي وباكستاني 🇮🇳", emoji: "🍛", keywords: ["indian", "pakistani"] },
  { id: "italian", ar: "إيطالي وبيتزا 🇮🇹", emoji: "🍕", keywords: ["italian", "pizza", "romana"] },
  { id: "japanese", ar: "ياباني وسوشي 🇯🇵", emoji: "🍣", keywords: ["japanese", "sushi"] },
  { id: "chinese", ar: "صيني وآسيوي 🇨🇳", emoji: "🥢", keywords: ["chinese", "asian", "thai"] },
  { id: "seafood", ar: "مأكولات بحرية 🦐", emoji: "🐟", keywords: ["seafood"] },
  { id: "american", ar: "أمريكي وبرجر 🍔", emoji: "🍔", keywords: ["american", "fast food", "burger", "steakhouse"] },
  { id: "grill", ar: "مشاوي وستيك 🥩", emoji: "🔥", keywords: ["barbecue", "grill", "steakhouse", "brazilian"] },
  { id: "cafe", ar: "كافيه ومخبوزات ☕", emoji: "🍰", keywords: ["cafe", "french", "bakery", "dessert"] },
  { id: "mexican", ar: "مكسيكي 🇲🇽", emoji: "🌮", keywords: ["mexican"] },
  { id: "healthy", ar: "صحي وخفيف 🥗", emoji: "🥑", keywords: ["healthy", "vegetarian", "vegan"] },
];

export const CITIES: {
  id: string;
  ar: string;
  emoji: string;
  region: string;
  keys: string[];
  nearby: string[];
}[] = [
  { id: "riyadh", ar: "الرياض", emoji: "🏙️", region: "Riyadh", keys: ["riyadh"], nearby: [] },
  { id: "jeddah", ar: "جدة", emoji: "🌊", region: "Jeddah", keys: ["jeddah"], nearby: [] },
  {
    id: "khobar",
    ar: "الخبر",
    emoji: "🌉",
    region: "Eastern_Province",
    keys: ["al khobar", "khobar"],
    nearby: ["dammam", "dhahran"],
  },
  {
    id: "dammam",
    ar: "الدمام",
    emoji: "🏬",
    region: "Eastern_Province",
    keys: ["dammam"],
    nearby: ["khobar", "dhahran"],
  },
  {
    id: "jubail",
    ar: "الجبيل",
    emoji: "⚓",
    region: "Eastern_Province",
    keys: ["al jubail", "jubail"],
    nearby: [],
  },
  {
    id: "ahsa",
    ar: "الأحساء",
    emoji: "🌴",
    region: "Eastern_Province",
    keys: ["al ahsa", "ahsa", "al hofuf", "hofuf"],
    nearby: [],
  },
  {
    id: "dhahran",
    ar: "الظهران",
    emoji: "🏛️",
    region: "Eastern_Province",
    keys: ["dhahran"],
    nearby: ["khobar", "dammam"],
  },
  {
    id: "eastern",
    ar: "المنطقة الشرقية كلها",
    emoji: "🇸🇦",
    region: "Eastern_Province",
    keys: [],
    nearby: ["khobar", "dammam", "jubail", "ahsa", "dhahran"],
  },
];

export const FAVORITE_DISHES = [
  "كبسة دجاج",
  "مندي لحم",
  "شاورما صاج",
  "مشاوي مشكلة",
  "حمص وتبولة",
  "سوشي رول",
  "بيتزا نابوليتانا",
  "باستا تروفل",
  "برجر لحم مشوي",
  "ستيك ريب آي",
  "روبيان جامبو",
  "برياني دجاج",
  "طاجن بحري",
  "كنافة نابلسية",
  "تشيز كيك",
];

export const CRAVINGS: { id: string; ar: string; emoji: string; keywords: string[] }[] = [
  { id: "kabsa", ar: "كبسة ومندي سعودي أصيل", emoji: "🍚", keywords: ["middle eastern", "arabic", "lebanese"] },
  { id: "grill", ar: "مشاوي وستيك على الفحم", emoji: "🥩", keywords: ["barbecue", "grill", "steakhouse", "brazilian"] },
  { id: "sushi", ar: "سوشي طازج وأكل آسيوي", emoji: "🍣", keywords: ["japanese", "sushi", "asian", "chinese"] },
  { id: "pizza", ar: "بيتزا حطب وباستا إيطالية", emoji: "🍕", keywords: ["italian", "pizza"] },
  { id: "burger", ar: "برجر عصير ووجبة سريعة", emoji: "🍔", keywords: ["american", "fast food", "burger"] },
  { id: "seafood", ar: "سمك طازج وروبيان بحري", emoji: "🦐", keywords: ["seafood"] },
  { id: "shawarma", ar: "شاورما ومقبلات شامية", emoji: "🥙", keywords: ["lebanese", "middle eastern", "fast food"] },
  { id: "indian", ar: "أكل هندي غني بالبهارات", emoji: "🍛", keywords: ["indian", "pakistani"] },
  { id: "cafe", ar: "قهوة مختصة وحلويات راقية", emoji: "☕", keywords: ["cafe", "french", "bakery"] },
  { id: "healthy", ar: "سلطة وصحي خفيف", emoji: "🥗", keywords: ["healthy", "vegetarian", "vegan", "salad"] },
  { id: "anything", ar: "مفتوح لأي تجربة ممتازة", emoji: "✨", keywords: [] },
];

export function detectCity(location: string, region: string): { id: string; label: string } {
  const loc = `${location} ${region}`.toLowerCase();
  for (const city of CITIES) {
    if (city.id === "eastern") continue;
    if (city.keys.some((k) => loc.includes(k))) {
      return { id: city.id, label: city.ar };
    }
  }
  const regionCity = CITIES.find((c) => c.region === region && c.id !== "eastern");
  if (regionCity) return { id: regionCity.id, label: regionCity.ar };
  return { id: "unknown", label: region || "السعودية" };
}

export function cuisineLabel(id: string): string {
  return CUISINES.find((c) => c.id === id)?.ar ?? id;
}

