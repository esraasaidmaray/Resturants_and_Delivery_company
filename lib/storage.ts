import type { Preferences } from "./types";

const KEY = "thawq-preferences";

export const emptyPreferences = (): Preferences => ({
  cityId: "",
  cuisines: [],
  allergies: [],
  diet: "none",
  favorites: [],
  freeText: "",
  craving: "",
  budget: "any",
  occasion: "any",
});

export function savePreferences(prefs: Preferences) {
  sessionStorage.setItem(KEY, JSON.stringify(prefs));
}

export function loadPreferences(): Preferences | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Preferences;
  } catch {
    return null;
  }
}
