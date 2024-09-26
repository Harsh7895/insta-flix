import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import userReducer from "./user/userSlice.js";
import storyReducer from "./story/yourStory.js"; // Import the storySlice
import storage from "redux-persist/lib/storage";

// Only persist the userReducer, but not the storyReducer
const persistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["user"], // Only persist the user slice
};

const rootReducer = combineReducers({
  user: userReducer, // This will be persisted
  story: storyReducer, // This will NOT be persisted
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
