import User from "../models/user.schema.js";
import Story from "../models/story.schema.js";
import { ErrorHandler } from "../utils/error.js"; // Assuming you have a custom error handler

export const toggleBookmarkStory = async (req, res, next) => {
  const { storyId, slideId } = req.body;

  try {
    const { id } = req.user; // Get the user ID from the authenticated user (e.g., from a token)

    // Find the story by storyId
    const story = await Story.findById(storyId);
    if (!story) {
      return next(ErrorHandler(404, "Story not found!"));
    }

    // Check if the slide exists in the story
    const slide = story.slides.find((s) => s._id.toString() === slideId);
    if (!slide) {
      return next(ErrorHandler(404, "Slide not found in the story!"));
    }

    // Find the user by their ID
    const user = await User.findById(id);
    if (!user) {
      return next(ErrorHandler(404, "User not found!"));
    }

    // Check if the bookmark already exists
    const bookmarkIndex = user.bookmarks.findIndex(
      (bookmark) =>
        bookmark.storyId.toString() === storyId &&
        bookmark.slideId.toString() === slideId
    );

    if (bookmarkIndex !== -1) {
      // If the bookmark exists, remove it (unbookmark)
      user.bookmarks.splice(bookmarkIndex, 1);
      await user.save();

      const { password, ...rest } = user._doc;

      return res.status(200).json({
        success: true,
        message: "Story and slide unbookmarked successfully!",
        isBookmarked: false,
        rest,
      });
    }

    // If the bookmark doesn't exist, add it
    user.bookmarks.push({ storyId, slideId });
    await user.save();

    const { password, ...rest } = user._doc;

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Story and slide bookmarked successfully!",
      isBookmarked: true,
      rest,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLikeStory = async (req, res, next) => {
  const { storyId, slideId } = req.body;

  try {
    const { id } = req.user; // Get the user ID from the authenticated user

    // Find the story by storyId
    const story = await Story.findById(storyId);
    if (!story) {
      return next(ErrorHandler(404, "Story not found!"));
    }

    // Check if the slide exists in the story
    const slideIndex = story.slides.findIndex(
      (s) => s._id.toString() === slideId
    );
    if (slideIndex === -1) {
      return next(ErrorHandler(404, "Slide not found in the story!"));
    }

    // Find the user by their ID
    const user = await User.findById(id);
    if (!user) {
      return next(ErrorHandler(404, "User not found!"));
    }

    // Check if the slide is already liked by the user
    const likeIndex = user.likes.findIndex(
      (like) =>
        like.storyId.toString() === storyId &&
        like.slideId.toString() === slideId
    );

    if (likeIndex !== -1) {
      // If the like exists, remove it (unlike)
      user.likes.splice(likeIndex, 1);
      // Decrement like count for the slide
      story.slides[slideIndex].likeCount =
        (story.slides[slideIndex].likeCount || 0) - 1;
      await user.save();
      await story.save(); // Save the updated story

      const { password, ...rest } = user._doc;

      return res.status(200).json({
        success: true,
        message: "Slide unliked successfully!",
        isLiked: false,
        rest,
      });
    }

    // If the like doesn't exist, add it
    user.likes.push({ storyId, slideId });
    // Increment like count for the slide
    story.slides[slideIndex].likeCount =
      (story.slides[slideIndex].likeCount || 0) + 1;
    await user.save();
    await story.save(); // Save the updated story

    const { password, ...rest } = user._doc;

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Slide liked successfully!",
      isLiked: true,
      rest,
    });
  } catch (error) {
    next(error);
  }
};
