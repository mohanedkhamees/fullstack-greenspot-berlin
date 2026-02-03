import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface NeedsReviewState {
  locationIds: string[];
  currentUsername: string | null;
}

const getStorageKey = (username: string | null): string => {
  if (!username) return "needsReviewLocations_guest";
  return `needsReviewLocations_${username}`;
};

const loadFromLocalStorage = (username: string | null): string[] => {
  try {
    const key = getStorageKey(username);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Silent fail
  }
  return [];
};

const saveToLocalStorage = (locationIds: string[], username: string | null) => {
  try {
    const key = getStorageKey(username);
    localStorage.setItem(key, JSON.stringify(locationIds));
  } catch (e) {
    // Silent fail
  }
};

const initialState: NeedsReviewState = {
  locationIds: [],
  currentUsername: null,
};

const needsReviewSlice = createSlice({
  name: "needsReview",
  initialState,
  reducers: {
    initializeForUser: (state, action: PayloadAction<string | null>) => {
      const username = action.payload;
      state.currentUsername = username;
      state.locationIds = loadFromLocalStorage(username);
    },
    markAsNeedsReview: (state, action: PayloadAction<string>) => {
      const locationId = action.payload;
      if (!state.locationIds.includes(locationId)) {
        state.locationIds.push(locationId);
        saveToLocalStorage(state.locationIds, state.currentUsername);
      }
    },
    unmarkAsNeedsReview: (state, action: PayloadAction<string>) => {
      const locationId = action.payload;
      state.locationIds = state.locationIds.filter((id) => id !== locationId);
      saveToLocalStorage(state.locationIds, state.currentUsername);
    },
    clearAll: (state) => {
      state.locationIds = [];
      saveToLocalStorage(state.locationIds, state.currentUsername);
    },
  },
});

export const {
  initializeForUser,
  markAsNeedsReview,
  unmarkAsNeedsReview,
  clearAll,
} = needsReviewSlice.actions;
export default needsReviewSlice.reducer;
