export type Allergy =
  | "nuts"
  | "gluten"
  | "dairy"
  | "seafood"
  | "eggs"
  | "spicy";

export type Diet = "none" | "vegetarian" | "vegan" | "halal";

export type Budget = "any" | "budget" | "mid" | "fine";

export type Occasion = "any" | "quick" | "family" | "friends" | "date" | "business";

export type Preferences = {
  cityId: string;
  cuisines: string[];
  allergies: Allergy[];
  diet: Diet;
  favorites: string[];
  freeText: string;
  craving: string;
  budget: Budget;
  occasion: Occasion;
};

export type Restaurant = {
  id: string;
  name: string;
  region: string;
  cityId: string;
  cityLabel: string;
  address: string;
  location: string;
  cuisines: string[];
  primaryCuisine: string;
  tags: string[];
  reviews: number;
  rating: number;
  hours: string;
  rankText: string;
  phone: string;
  priceRange: string;
  priceBand: Budget;
  isOpenAndActive?: boolean;
};

export type Recommendation = {
  restaurant: Restaurant;
  match: number;
  reasons: string[];
  dishes: string[];
  aiInsight: string;
  allergySafeFlags: string[];
  menuUrl?: string;
};

export type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
};

