// src/domain/API.ts

import type { Location } from "./Location";

const API_BASE = "http://localhost:8000";

export async function fetchLocations(): Promise<Location[]> {
  const response = await fetch(`${API_BASE}/locations`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch locations");
  }

  return response.json();
}
