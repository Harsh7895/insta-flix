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