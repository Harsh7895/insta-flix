// storySlice.js
import { createSlice } from "@reduxjs/toolkit";

const storySlice = createSlice({
  name: "story",
  initialState: {
    stories: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchStoriesSuccess: (state, action) => {
      state.stories = action.payload;
    },
    addStory: (state, action) => {
      state.stories.unshift(action.payload); // Add new story to the beginning of the array
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { fetchStoriesSuccess, addStory, setLoading, setError } =
  storySlice.actions;
export default storySlice.reducer;
