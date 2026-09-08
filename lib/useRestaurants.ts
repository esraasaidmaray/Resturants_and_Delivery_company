"use client";

import { useEffect, useState } from "react";
import { parseRestaurants } from "@/lib/parse";
import type { Restaurant } from "@/lib/types";

let cache: Restaurant[] | null = null;

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    fetch("/data/restaurants.csv")
      .then((res) => {
        if (!res.ok) throw new Error("failed to load restaurants");
        return res.text();
      })
      .then((csv) => {
        if (cancelled) return;
        cache = parseRestaurants(csv);
        setRestaurants(cache);
      })
      .catch(() => {
        if (!cancelled) setRestaurants([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { restaurants, loading };
}
