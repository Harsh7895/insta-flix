import Story from "../models/story.schema.js";
import User from "../models/user.schema.js";
import { ErrorHandler } from "../utils/error.js";

export const CreateStory = async (req, res, next) => {
  try {
    const userId = req.user;
    const { slides, category } = req.body;

    if (!category || !Array.isArray(slides)) {
      return res
        .status(400)
        .json({ message: "Missing required fields or invalid data format" });
    }

    const user = await User.findById(userId.id);
    if (!user) {
      return next(
        ErrorHandler(401, "Something went wrong , please try again later!")
      );
    }
    const story = await Story.create({ category, createdBy: user._id, slides });
    user.stories.push(story._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Story uploaded successfully",
      story,
    });
  } catch (error) {
    next(error);
  }
};

export const editStory = async (req, res, next) => {
  try {
    const { id, slides, category } = req.body;
    if (!id || !category || !Array.isArray(slides)) {
      return res
        .status(400)
        .json({ message: "Missing required fields or invalid data format" });
    }
    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    story.slides = slides;
    story.category = category;
    await story.save();
    res.status(201).json({
      success: true,
      message: "Story updated successfully",
      story,
    });
  } catch (error) {
    next(error);
  }
};

export const getStory = async (req, res, next) => {
  const { id } = req.body;
  try {
    const story = await Story.findById(id);
    if (!story) {
      return next(ErrorHandler(401, "Story is no more available"));
    }

    res.status(200).json({
      success: true,
      story,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStories = async (req, res, next) => {
  try {
    const userId = req.user;
    const stories = await Story.find({ createdBy: userId.id });
    if (!stories) {
      return next(ErrorHandler(401, "There is no stories !"));
    }
    res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookmarkedStories = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id).populate({
      path: "bookmarks.storyId",
      select: "_id title slides",
    });

    if (!user) {
      return next(ErrorHandler(404, "User not found!"));
    }

    const bookmarkedStories = user.bookmarks.map((bookmark) => {
      const story = bookmark.storyId;

      const bookmarkedSlides = story.slides.filter((slide) =>
        bookmark.slides.includes(slide._id.toString())
      );

      return {
        _id: story._id,
        category: story.category,
        slides: bookmarkedSlides,
      };
    });

    return res.status(200).json({
      success: true,
      bookmarkedStories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryStories = async (req, res) => {
  let { category } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;

  let query = {};
  if (category && category !== "All") {
    query.category = new RegExp(`^${category}$`, "i");
  }

  try {
    const stories = await Story.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "username")
      .sort({ createdAt: -1, _id: -1 });

    const totalStories = await Story.countDocuments(query);

    if (stories.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No stories available in this category",
        stories: [],
        totalStories: 0,
      });
    }

    console.log(category, stories);
    return res.status(200).json({
      success: true,
      stories,
      totalStories,
      currentPage: page,
      totalPages: Math.ceil(totalStories / limit),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching stories",
    });
  }
};
