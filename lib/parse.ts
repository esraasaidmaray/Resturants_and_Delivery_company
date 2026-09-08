import type { Budget, Restaurant } from "./types";
import { detectCity } from "./catalog";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (c !== "\r") {
      cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function splitCuisines(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.replace(/\u00a0/g, " ").trim())
    .filter((s) => s.length > 1);
}

function parsePriceBand(priceRange: string): Budget {
  const nums = [...priceRange.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
  if (nums.length === 0) return "any";
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  if (avg < 50) return "budget";
  if (avg < 150) return "mid";
  return "fine";
}

function clean(value: string): string {
  return value.replace(/\u00a0/g, " ").trim();
}

function isClosedRecord(name: string, hours: string, rankText: string): boolean {
  const combined = `${name} ${hours} ${rankText}`.toLowerCase();
  if (combined.includes("permanently closed") || combined.includes("temporarily closed") || combined.includes("closed permanently") || combined.includes("out of business") || combined.includes("مغلق تماما") || combined.includes("مغلق نهائيا")) {
    return true;
  }
  if (name.trim().toLowerCase() === "restaurants" || name.trim().length < 2) {
    return true;
  }
  return false;
}

export function parseRestaurants(csv: string): Restaurant[] {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const iName = idx("restaurant_name");
  const iRegion = idx("city");
  const iFood = idx("food_type");
  const iPrimary = idx("food_type1");
  const iLoc = idx("location");
  const iAddr1 = idx("address_line1");
  const iAddr2 = idx("address_line2");
  const iReviews = idx("number_of_reviews");
  const iHours = idx("opening_hour");
  const iRank = idx("out_of");
  const iPhone = idx("phone");
  const iPrice = idx("price_range");
  const iScore = idx("review_score");

  const seen = new Set<string>();
  const list: Restaurant[] = [];

  rows.slice(1).forEach((row, index) => {
    const name = clean(row[iName] ?? "");
    if (!name) return;
    const hours = clean(row[iHours] ?? "");
    const rankText = clean(row[iRank] ?? "");

    if (isClosedRecord(name, hours, rankText)) return;

    const location = clean(row[iLoc] ?? "");
    const key = `${name.toLowerCase()}|${location.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);

    const cuisines = splitCuisines(row[iFood] ?? "");
    const primary = clean(row[iPrimary] ?? cuisines[0] ?? "");
    const region = clean(row[iRegion] ?? "");
    const city = detectCity(location, region);
    const address = [clean(row[iAddr1] ?? ""), clean(row[iAddr2] ?? "")]
      .filter(Boolean)
      .join("، ");

    const reviews = Number(clean(row[iReviews] ?? "0")) || 0;
    const rating = Number(clean(row[iScore] ?? "0")) || 0;

    // Filter out unrated or zero-review obsolete listings
    if (rating === 0 && reviews === 0) return;
    if (rating < 3.0) return;

    const isOpenAndActive = !hours.toLowerCase().includes("closed permanently") && rating >= 3.5 && reviews >= 5;

    list.push({
      id: `${index}-${name.slice(0, 24)}`,
      name,
      region,
      cityId: city.id,
      cityLabel: city.label,
      address: address || location,
      location,
      cuisines,
      primaryCuisine: primary,
      tags: cuisines.map((c) => c.toLowerCase()),
      reviews,
      rating,
      hours,
      rankText,
      phone: clean(row[iPhone] ?? ""),
      priceRange: clean(row[iPrice] ?? ""),
      priceBand: parsePriceBand(row[iPrice] ?? ""),
      isOpenAndActive,
    });
  });

  return list;
}

