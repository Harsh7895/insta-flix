import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  slides: [
    {
      heading: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      mediaSrc: {
        type: String,
        required: true,
      },
      mediaType: {
        type: String,
      },
      likeCount: {
        type: Number,
      },
    },
  ],
});

const Story = mongoose.model("Story", storySchema);
export default Story;
