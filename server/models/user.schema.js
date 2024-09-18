import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  stories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },
  ],
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
