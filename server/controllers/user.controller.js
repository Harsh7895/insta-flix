import User from "../models/user.schema.js";
import Story from "../models/story.schema.js";
import { ErrorHandler } from "../utils/error.js";

export const toggleBookmarkStory = async (req, res, next) => {
  const { storyId, slideId } = req.body;

  try {
    const { id } = req.user;

    const story = await Story.findById(storyId);
    if (!story) {
      return next(ErrorHandler(404, "Story not found!"));
    }

    const slide = story.slides.find((s) => s._id.toString() === slideId);
    if (!slide) {
      return next(ErrorHandler(404, "Slide not found in the story!"));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(ErrorHandler(404, "User not found!"));
    }

    let isBookmarked = false;
    const bookmarkedStory = user?.bookmarks?.find(
      (s) => s.storyId.toString() === storyId
    );

    if (bookmarkedStory) {
      const bookmarkedSlideIndex = bookmarkedStory.slides.findIndex(
        (s) => s.toString() === slideId
      );

      if (bookmarkedSlideIndex !== -1) {
        // Slide already bookmarked, remove it
        bookmarkedStory.slides.splice(bookmarkedSlideIndex, 1);
        if (bookmarkedStory.slides.length === 0) {
          // If no slides left, remove the story from bookmarks
          user.bookmarks = user.bookmarks.filter(
            (s) => s.storyId.toString() !== storyId
          );
        }
      } else {
        // Add the slide to bookmarks
        bookmarkedStory.slides.push(slideId);
        isBookmarked = true;
      }
    } else {
      // Add the story and slide to bookmarks
      user.bookmarks.push({ storyId, slides: [slideId] });
      isBookmarked = true;
    }

    await user.save();

    const { password, ...rest } = user._doc;
    return res.status(200).json({
      success: true,
      message: isBookmarked
        ? "Slide bookmarked successfully!"
        : "Slide unbookmarked successfully!",
      isBookmarked,
      rest,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLikeStory = async (req, res, next) => {
  const { storyId, slideId } = req.body;

  try {
    console.log("hello");
    const { id } = req.user; // Get the user ID from the authenticated user

    const story = await Story.findById(storyId);
    if (!story) {
      return next(ErrorHandler(404, "Story not found!"));
    }

    const slide = story.slides.find((s) => s._id.toString() === slideId);
    if (!slide) {
      return next(ErrorHandler(404, "Slide not found in the story!"));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(ErrorHandler(404, "User not found!"));
    }

    let isLiked = false;
    const likedStory = user?.likes?.find(
      (s) => s.storyId.toString() === storyId
    );

    if (likedStory) {
      const likedSlideIndex = likedStory.slides.findIndex(
        (s) => s.toString() === slideId
      );

      if (likedSlideIndex !== -1) {
        likedStory.slides.splice(likedSlideIndex, 1);
        story.slides.find((s) => s._id.toString() === slideId).likeCount -= 1;

        if (likedStory.slides.length === 0) {
          user.likes = user.likes.filter(
            (s) => s.storyId.toString() !== storyId
          );
        }
      } else {
        likedStory.slides.push(slideId);
        story.slides.find((s) => s._id.toString() === slideId).likeCount += 1;
        isLiked = true;
      }
    } else {
      user.likes.push({ storyId, slides: [slideId] });
      story.slides.find((s) => s._id.toString() === slideId).likeCount += 1;
      isLiked = true;
    }

    await user.save();
    await story.save(); // Save the updated story

    const { password, ...rest } = user._doc;

    return res.status(200).json({
      success: true,
      message: isLiked
        ? "Slide liked successfully!"
        : "Slide unliked successfully!",
      isLiked,
      rest,
    });
  } catch (error) {
    next(error);
  }
};
