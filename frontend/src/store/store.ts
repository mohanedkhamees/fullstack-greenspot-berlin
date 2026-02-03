import { configureStore } from "@reduxjs/toolkit";
import needsReviewReducer from "./needsReviewSlice";

export const store = configureStore({
  reducer: {
    needsReview: needsReviewReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
