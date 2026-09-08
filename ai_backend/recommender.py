import os
import math
import pandas as pd
from typing import List, Dict, Any

# Catalog Definitions
CITIES = [
    {"id": "riyadh", "ar": "الرياض", "region": "Riyadh", "keys": ["riyadh"], "nearby": []},
    {"id": "jeddah", "ar": "جدة", "region": "Jeddah", "keys": ["jeddah"], "nearby": []},
    {"id": "khobar", "ar": "الخبر", "region": "Eastern_Province", "keys": ["al khobar", "khobar"], "nearby": ["dammam", "dhahran"]},
    {"id": "dammam", "ar": "الدمام", "region": "Eastern_Province", "keys": ["dammam"], "nearby": ["khobar", "dhahran"]},
    {"id": "jubail", "ar": "الجبيل", "region": "Eastern_Province", "keys": ["al jubail", "jubail"], "nearby": []},
    {"id": "ahsa", "ar": "الأحساء", "region": "Eastern_Province", "keys": ["al ahsa", "ahsa", "al hofuf", "hofuf"], "nearby": []},
    {"id": "dhahran", "ar": "الظهران", "region": "Eastern_Province", "keys": ["dhahran"], "nearby": ["khobar", "dammam"]},
    {"id": "eastern", "ar": "المنطقة الشرقية كلها", "region": "Eastern_Province", "keys": [], "nearby": ["khobar", "dammam", "jubail", "ahsa", "dhahran"]}
]

CUISINES = [
    {"id": "saudi", "ar": "سعودي وعربي 🇸🇦", "keywords": ["middle eastern", "arabic", "saudi"]},
    {"id": "lebanese", "ar": "لبناني وشامي 🇱🇧", "keywords": ["lebanese", "syrian"]},
    {"id": "egyptian", "ar": "مصري 🇪🇬", "keywords": ["egyptian"]},
    {"id": "turkish", "ar": "تركي 🇹🇷", "keywords": ["turkish"]},
    {"id": "moroccan", "ar": "مغربي 🇲🇦", "keywords": ["moroccan"]},
    {"id": "indian", "ar": "هندي وباكستاني 🇮🇳", "keywords": ["indian", "pakistani"]},
    {"id": "italian", "ar": "إيطالي وبيتزا 🇮🇹", "keywords": ["italian", "pizza", "romana"]},
    {"id": "japanese", "ar": "ياباني وسوشي 🇯🇵", "keywords": ["japanese", "sushi"]},
    {"id": "chinese", "ar": "صيني وآسيوي 🇨🇳", "keywords": ["chinese", "asian", "thai"]},
    {"id": "seafood", "ar": "مأكولات بحرية 🦐", "keywords": ["seafood"]},
    {"id": "american", "ar": "أمريكي وبرجر 🍔", "keywords": ["american", "fast food", "burger", "steakhouse"]},
    {"id": "grill", "ar": "مشاوي وستيك 🥩", "keywords": ["barbecue", "grill", "steakhouse", "brazilian"]},
    {"id": "cafe", "ar": "كافيه ومخبوزات ☕", "keywords": ["cafe", "french", "bakery", "dessert"]},
    {"id": "mexican", "ar": "مكسيكي 🇲🇽", "keywords": ["mexican"]},
    {"id": "healthy", "ar": "صحي وخفيف 🥗", "keywords": ["healthy", "vegetarian", "vegan"]}
]

CRAVINGS = [
    {"id": "kabsa", "keywords": ["middle eastern", "arabic", "lebanese"]},
    {"id": "grill", "keywords": ["barbecue", "grill", "steakhouse", "brazilian"]},
    {"id": "sushi", "keywords": ["japanese", "sushi", "asian", "chinese"]},
    {"id": "pizza", "keywords": ["italian", "pizza"]},
    {"id": "burger", "keywords": ["american", "fast food", "burger"]},
    {"id": "seafood", "keywords": ["seafood"]},
    {"id": "shawarma", "keywords": ["lebanese", "middle eastern", "fast food"]},
    {"id": "indian", "keywords": ["indian", "pakistani"]},
    {"id": "cafe", "keywords": ["cafe", "french", "bakery"]},
    {"id": "healthy", "keywords": ["healthy", "vegetarian", "vegan", "salad"]}
]

DISHES_MAP = {
    "saudi": ["كبسة دجاج شواية", "مندي لحم بلدي", "جريش حائلي", "مرقوق بالخضار"],
    "middle eastern": ["كبسة لحم نعيمي", "مندي بالفرن", "مطبق بحري", "مشاوي مشكلة"],
    "arabic": ["كبسة دجاج", "مرقوق", "جريش باللبن", "كنافة بالقشطة"],
    "lebanese": ["مشاوي مشكلة كباب وكفتة", "حمص باللحمة والسنوبر", "تبولة وفتوش", "شاورما دجاج صاج"],
    "egyptian": ["كشري مصري مخصوص", "طاجن ملوخية بالدجاج", "فول وطعمية سخنة"],
    "turkish": ["إسكندر كباب", "شيش طاووق تركي", "فطائر بيتي بالسجق"],
    "moroccan": ["طاجين لحم بالبرقوق", "كسكسي بالخضار", "حريرة مغربية"],
    "indian": ["برياني حيدر أباد", "دجاج تيكا ماسالا", "خبز نان بالثوم والزبادي"],
    "italian": ["بيتزا نابوليتانا بالحطب", "باستا تروفل وكاربونارا", "لازانيا بولونيز"],
    "japanese": ["سوشي رول كاليفورنيا", "ساشيمي سالمون طازج", "رامن دجاج بالمسو"],
    "seafood": ["روبيان جامبو مشوي بالثوم", "سمك هامور مقلي بالبهارات", "طاجن سي فود"],
    "american": ["برجر لحم بلاك أنجوس", "ستيك ريب آي مشوي", "أجنحة دجاج بوفالو"],
    "grill": ["ريش غنم مشوية", "بريسكت مدخن", "دجاج مشوي بالفحم"],
    "cafe": ["قهوة مختصة فلات وايت", "فرنش توست مكرمل", "تشيز كيك التوت"]
}

def detect_city(location: str, region: str) -> Dict[str, str]:
    loc = f"{location} {region}".lower()
    for c in CITIES:
        if c["id"] == "eastern":
            continue
        if any(k in loc for k in c["keys"]):
            return {"id": c["id"], "label": c["ar"]}
    for c in CITIES:
        if c["region"] == region and c["id"] != "eastern":
            return {"id": c["id"], "label": c["ar"]}
    return {"id": "unknown", "label": region or "السعودية"}

def parse_price_band(price_range: str) -> str:
    import re
    nums = [int(n) for n in re.findall(r'\d+', str(price_range))]
    if not nums:
        return "any"
    avg = sum(nums) / len(nums)
    if avg < 50:
        return "budget"
    if avg < 150:
        return "mid"
    return "fine"

def load_restaurants_df() -> pd.DataFrame:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "public", "data", "restaurants.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(base_dir, "resturantsframe-Clean.csv")
    if not os.path.exists(csv_path):
        return pd.DataFrame()

    df = pd.read_csv(csv_path).fillna("")
    
    restaurants = []
    seen = set()

    for idx, row in df.iterrows():
        name = str(row.get("restaurant_name", "")).strip().replace("\xa0", " ")
        if not name or len(name) < 2:
            continue

        hours = str(row.get("opening_hour", "")).strip().replace("\xa0", " ")
        rank_text = str(row.get("out_of", "")).strip().replace("\xa0", " ")
        combined = f"{name} {hours} {rank_text}".lower()

        if any(w in combined for w in ["permanently closed", "closed permanently", "out of business", "مغلق تماما", "مغلق نهائيا"]):
            continue

        location = str(row.get("location", "")).strip().replace("\xa0", " ")
        key = f"{name.lower()}|{location.lower()}"
        if key in seen:
            continue
        seen.add(key)

        food_type = str(row.get("food_type", "")).strip()
        cuisines = [c.strip().replace("\xa0", " ") for c in food_type.split(",") if len(c.strip()) > 1]
        primary = str(row.get("food_type1", "")).strip() or (cuisines[0] if cuisines else "")
        region = str(row.get("city", "")).strip()
        city_info = detect_city(location, region)

        addr1 = str(row.get("address_line1", "")).strip()
        addr2 = str(row.get("address_line2", "")).strip()
        address = "، ".join(filter(None, [addr1, addr2])) or location

        try:
            reviews = int(float(row.get("number_of_reviews", 0)))
        except:
            reviews = 0

        try:
            rating = float(row.get("review_score", 0))
        except:
            rating = 0.0

        if rating == 0 and reviews == 0:
            continue
        if rating < 3.0:
            continue

        price_range = str(row.get("price_range", "")).strip()

        restaurants.append({
            "id": f"{idx}-{name[:24]}",
            "name": name,
            "region": region,
            "cityId": city_info["id"],
            "cityLabel": city_info["label"],
            "address": address,
            "location": location,
            "cuisines": cuisines,
            "primaryCuisine": primary,
            "tags": [c.lower() for c in cuisines],
            "reviews": reviews,
            "rating": rating,
            "hours": hours,
            "rankText": rank_text,
            "phone": str(row.get("phone", "")).strip(),
            "priceRange": price_range,
            "priceBand": parse_price_band(price_range),
            "isOpenAndActive": ("closed" not in hours.lower()) and rating >= 3.5 and reviews >= 5
        })

    return pd.DataFrame(restaurants)

# Load global dataset into memory
RESTAURANTS_DF = load_restaurants_df()

def has_allergy_conflict(r: dict, prefs: dict) -> bool:
    text = f"{r['name']} {' '.join(r['cuisines'])} {r['primaryCuisine']} {r['address']} {r['location']}".lower()
    allergies = prefs.get("allergies", [])
    diet = prefs.get("diet", "none")

    if "seafood" in allergies and ("seafood" in text or "sushi" in text):
        return True
    if diet == "vegetarian" and ("steakhouse" in text or "barbecue" in text) and "vegetarian" not in text:
        return True
    if diet == "vegan" and "vegan" not in text:
        if any(w in text for w in ["steakhouse", "barbecue", "seafood"]):
            return True
    return False

def get_signature_dishes(cuisines: List[str], craving: str = "") -> List[str]:
    found = []
    keys = [c.lower() for c in cuisines]
    for key in keys:
        for c_key, dishes in DISHES_MAP.items():
            if key in c_key or c_key in key:
                found.extend(dishes)
    
    if craving == "kabsa":
        found[0:0] = ["كبسة دجاج شواية", "مندي لحم بلدي"]
    elif craving == "sushi":
        found[0:0] = ["سوشي رول كاليفورنيا", "ساشيمي سالمون"]
    elif craving == "pizza":
        found[0:0] = ["بيتزا نابوليتانا بالحطب", "باستا تروفل"]
    elif craving == "burger":
        found[0:0] = ["برجر لحم بلاك أنجوس", "سلايدرز دجاج"]
    elif craving == "seafood":
        found[0:0] = ["روبيان جامبو مشوي", "سمك هامور طازج"]

    unique = list(dict.fromkeys(found))
    if not unique:
        return ["طبق الموسم المميز", "وجبة الشيف الخاصة", "المقبلات المشكلة"]
    return unique[:4]

def recommend_restaurants(prefs: dict) -> List[dict]:
    if RESTAURANTS_DF.empty:
        return []

    city_id = prefs.get("cityId", "")
    target_city = next((c for c in CITIES if c["id"] == city_id), None)
    
    selected_cuisines = prefs.get("cuisines", [])
    cuisine_kws = []
    for cid in selected_cuisines:
        c_obj = next((c for c in CUISINES if c["id"] == cid), None)
        if c_obj:
            cuisine_kws.extend(c_obj["keywords"])

    craving_id = prefs.get("craving", "")
    craving_obj = next((c for c in CRAVINGS if c["id"] == craving_id), None)
    free_text = f"{prefs.get('freeText', '')} {' '.join(prefs.get('favorites', []))}".lower()

    scored = []

    for _, r in RESTAURANTS_DF.iterrows():
        r_dict = r.to_dict()
        if has_allergy_conflict(r_dict, prefs):
            continue

        reasons = []
        safe_flags = []
        score = 10.0
        text = f"{r_dict['name']} {' '.join(r_dict['cuisines'])} {r_dict['primaryCuisine']} {r_dict['address']} {r_dict['location']}".lower()

        if target_city:
            same_city = (r_dict["cityId"] == target_city["id"]) or (target_city["id"] == "eastern")
            nearby = r_dict["cityId"] in target_city["nearby"]
            same_region = r_dict["region"] == target_city["region"]

            if target_city["id"] != "eastern" and same_city:
                score += 36
                reasons.append(f"قريب منك في {r_dict['cityLabel']}")
            elif nearby:
                score += 18
                reasons.append(f"في مدينة قريبة ({r_dict['cityLabel']})")
            elif same_region:
                score += 10
            else:
                continue

        cuisine_hits = sum(1 for kw in cuisine_kws if kw in text)
        if cuisine_hits > 0:
            score += min(28, 12 + cuisine_hits * 6)
            reasons.append("نوع الأكل مطابق تماماً لتفضيلك")

        if craving_obj and any(k in text for k in craving_obj["keywords"]):
            score += 16
            reasons.append("يناسب ما تشتهيه الآن")

        diet = prefs.get("diet", "none")
        allergies = prefs.get("allergies", [])

        if diet == "vegetarian" and "vegetarian" in text:
            score += 10
            reasons.append("خيارات نباتية متوفرة")
            safe_flags.append("خيارات نباتية 🥗")
        if diet == "vegan" and "vegan" in text:
            score += 12
            reasons.append("خيارات نباتية صرف")
            safe_flags.append("نباتي صرف 🥑")
        if "gluten" in allergies and "gluten free" in text:
            score += 10
            reasons.append("خيارات خالية من الجلوتين")
            safe_flags.append("خالٍ من الجلوتين 🌾")

        if "سوشي" in free_text and "sushi" in text:
            score += 8
        if "كبسة" in free_text and any(k in text for k in ["middle eastern", "arabic"]):
            score += 8

        budget = prefs.get("budget", "any")
        if budget != "any" and r_dict["priceBand"] == budget:
            score += 8
            reasons.append("تناسب ميزانيتك المقترحة")

        # Quality Score Calculation
        rating_part = (max(r_dict["rating"], 0) / 5.0) * 18.0
        review_part = min(math.log10(r_dict["reviews"] + 1) / math.log10(400), 1.0) * 14.0
        score += (rating_part + review_part)

        if r_dict["rating"] >= 4.5 and r_dict["reviews"] >= 50:
            reasons.append(f"تقييم ممتاز ({r_dict['rating']}⭐) من {r_dict['reviews']} مراجعة")

        if not reasons:
            continue

        match_pct = max(60, min(99, int(round(score))))
        clean_reasons = list(dict.fromkeys(reasons))[:4]
        dishes = get_signature_dishes(r_dict["cuisines"], craving_id)
        
        top_reason = clean_reasons[0] if clean_reasons else "توصية مخصصة"
        ai_insight = f"اخترنا لك {r_dict['name']} بنسبة تطابق {match_pct}% لأجل: {top_reason}، وبناءً على تقييمه ({r_dict['rating']} من 5) مع {r_dict['reviews']} مراجعة في {r_dict['cityLabel']} (معالجة محرك Python 🐍)."

        import urllib.parse
        menu_query = f"restaurant {r_dict['name']} {r_dict['cityLabel']} Saudi Arabia menu قائمة الطعام"
        menu_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(menu_query)}"

        scored.append({
            "restaurant": r_dict,
            "match": match_pct,
            "reasons": clean_reasons,
            "dishes": dishes,
            "aiInsight": ai_insight,
            "allergySafeFlags": safe_flags,
            "menuUrl": menu_url
        })

    scored.sort(key=lambda x: (x["match"], x["restaurant"]["reviews"], x["restaurant"]["rating"]), reverse=True)
    return scored[:16]
