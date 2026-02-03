// src/domain/API.ts

import type { Location } from "./location";

const API_BASE = "http://localhost:8000";

export async function fetchLocations(): Promise<Location[]> {
  const response = await fetch(`${API_BASE}/locations`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch locations");
  }

  return response.json();
}

export async function getLocationById(id: string): Promise<Location> {
  const response = await fetch(`${API_BASE}/locations/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Location nicht gefunden");
    }
    const text = await response.text();
    throw new Error(text || "Failed to fetch location");
  }

  return response.json();
}

export interface CreateLocationData {
  title: string;
  longitude: number;
  latitude: number;
  date: number;
  category: string;
  description: string;
  street: string;
  zip: number;
  city: string;
  country: string;
  user: string;
  danger: string;
  time_category: string;
  tags: { tag: string }[];
}

export async function createLocation(
  data: CreateLocationData,
  userRole: string,
  imageFile?: File | null
): Promise<Location> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("longitude", String(data.longitude));
  formData.append("latitude", String(data.latitude));
  formData.append("date", String(data.date));
  formData.append("category", data.category);
  formData.append("description", data.description);
  formData.append("street", data.street);
  formData.append("zip", String(data.zip));
  formData.append("city", data.city);
  formData.append("country", data.country);
  formData.append("user", data.user);
  formData.append("danger", data.danger);
  formData.append("time_category", data.time_category);
  formData.append("tags", data.tags.map((t) => t.tag).join(","));
  
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE}/locations`, {
    method: "POST",
    headers: {
      "x-role": userRole,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Zugriff verweigert. Nur Administratoren können Locations erstellen.");
    }
    const text = await response.text();
    throw new Error(text || "Failed to create location");
  }

  return response.json();
}

export async function updateLocation(
  id: string,
  data: CreateLocationData,
  username: string,
  imageFile?: File | null
): Promise<Location> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("longitude", String(data.longitude));
  formData.append("latitude", String(data.latitude));
  formData.append("date", String(data.date));
  formData.append("category", data.category);
  formData.append("description", data.description);
  formData.append("street", data.street);
  formData.append("zip", String(data.zip));
  formData.append("city", data.city);
  formData.append("country", data.country);
  formData.append("user", data.user);
  formData.append("danger", data.danger);
  formData.append("time_category", data.time_category);
  formData.append("tags", data.tags.map((t) => t.tag).join(","));
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE}/locations/${id}`, {
    method: "PUT",
    headers: {
      "x-username": username,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Zugriff verweigert. Nur der Ersteller kann diese Location bearbeiten.");
    }
    const text = await response.text();
    throw new Error(text || "Failed to update location");
  }

  return response.json();
}

export async function deleteLocation(id: string, username: string): Promise<void> {
  const response = await fetch(`${API_BASE}/locations/${id}`, {
    method: "DELETE",
    headers: {
      "x-username": username,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Zugriff verweigert. Nur der Ersteller kann diese Location löschen.");
    }
    const text = await response.text();
    throw new Error(text || "Failed to delete location");
  }
}
