import { useEffect, useState } from "react";
import { FaBookmark, FaHeart } from "react-icons/fa";
import { IoPaperPlaneOutline } from "react-icons/io5";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom"; // Import React Router hooks
import "../styles/story.css";
import { useDispatch, useSelector } from "react-redux";
import { signInSuccess } from "../../redux/user/userSlice";

const api_url = "http://localhost:3000/api/v1";

{
  /* eslint-disable */
}
export default function StoryViewer({ storyId, slideId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [slideLikes, setSlideLikes] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams(); // React Router hook to handle query params
  const [bookmarkAndLikeLoading, setBookmarkAndLikeLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Fetch story data when component mounts or params change
  useEffect(() => {
    document.body.classList.add("no-scroll");
    const getStory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${api_url}/story/get-story`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ id: storyId }),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.message);
        } else {
          setStory(data.story);
          const slideIndex = data.story.slides.findIndex(
            (slide) => slide._id === slideId
          );
          setCurrentSlide(slideIndex !== -1 ? slideIndex : 0);
        }
      } catch (error) {
        toast.error("Error fetching story.");
      } finally {
        setLoading(false);
      }
    };

    getStory();
    return () => document.body.classList.remove("no-scroll");
  }, [storyId]);

  useEffect(() => {
    const checkBookMarked = () => {
      // Reset bookmark status before checking
      setIsBookmarked(false);

      // Check if currentUser, story, and current slide are available
      if (currentUser?.bookmarks && story?.slides?.[currentSlide]) {
        const isCurrentSlideBookmarked = currentUser.bookmarks.some(
          (bookmark) =>
            bookmark.storyId === storyId &&
            bookmark.slideId === story.slides[currentSlide]._id
        );

        // Set the bookmark status
        setIsBookmarked(isCurrentSlideBookmarked);
      }
    };
    const checkLiked = () => {
      // Reset bookmark status before checking
      setIsLiked(false);

      // Check if currentUser, story, and current slide are available
      if (currentUser?.likes && story?.slides?.[currentSlide]) {
        const isCurrentSlideLiked = currentUser.likes.some(
          (like) =>
            like.storyId === storyId &&
            like.slideId === story.slides[currentSlide]._id
        );

        // Set the bookmark status
        setIsLiked(isCurrentSlideLiked);
      }
    };
    const getLikesOnSlide = () => {
      // Reset like count before checking
      setSlideLikes(0);

      // Check if currentUser, story, and current slide are available
      if (story?.slides[currentSlide]?.likeCount) {
        setSlideLikes(story.slides[currentSlide].likeCount);
      }
    };

    getLikesOnSlide();
    checkBookMarked();
    checkLiked();
  }, [currentSlide, storyId, story]);

  // Handle navigation between slides
  const handleNextSlide = () => {
    if (story && currentSlide < story.slides.length - 1) {
      const newSlideIndex = currentSlide + 1;
      setCurrentSlide(newSlideIndex);

      // Update URL with React Router
      setSearchParams({
        storyId,
        slideId: story.slides[newSlideIndex]._id,
      });
    }
  };

  const handlePrevSlide = () => {
    if (story && currentSlide > 0) {
      const newSlideIndex = currentSlide - 1;
      setCurrentSlide(newSlideIndex);

      // Update URL with React Router
      setSearchParams({
        storyId,
        slideId: story.slides[newSlideIndex]._id,
      });
    }
  };

  const toggleBookMarkSlide = async (storyId, slideId) => {
    try {
      setBookmarkAndLikeLoading(true);
      const res = await fetch(`${api_url}/user/bookmark-toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({ storyId, slideId }),
      });

      const data = await res.json();
      if (data.success === false) {
        toast.error(data.message);
        return;
      }
      setIsBookmarked(data.isBookmarked);
      dispatch(signInSuccess({ token: currentUser.token, ...data.rest }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBookmarkAndLikeLoading(false);
    }
  };

  const toggleLikeSlide = async (storyId, slideId) => {
    try {
      const currentLikes = slideLikes;
      const currIsLiked = isLiked;
      setSlideLikes(!isLiked ? slideLikes + 1 : slideLikes - 1);
      setIsLiked(!isLiked);
      setBookmarkAndLikeLoading(true);
      const res = await fetch(`${api_url}/user/like-toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({ storyId, slideId }),
      });

      const data = await res.json();
      if (data.success === false) {
        toast.error(data.message);
        setSlideLikes(currentLikes);
        setIsLiked(currIsLiked);
        return;
      }
      setIsLiked(data.isLiked);

      dispatch(signInSuccess({ token: currentUser.token, ...data.rest }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBookmarkAndLikeLoading(false);
    }
  };

  // Copy shared link to clipboard
  const copyToClipboard = async () => {
    try {
      // Generate a shareable URL with the current story and slide
      const sharedLink = `${window.location.origin}?storyId=${storyId}&slideId=${story.slides[currentSlide]._id}`;
      await navigator.clipboard.writeText(sharedLink);
      toast.success("Link copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer">
        {loading ? (
          <p className="story-container">Loading...</p>
        ) : (
          <>
            <div className="story-container">
              <div className="slides-number">
                {story?.slides.map((val, index) => (
                  <div
                    key={val._id}
                    style={{
                      backgroundColor: index === currentSlide ? "white" : "",
                    }}
                  />
                ))}
              </div>
              <button className="close-btn" onClick={onClose}>
                ✕
              </button>
              <button className="share-btn" onClick={copyToClipboard}>
                <IoPaperPlaneOutline size={20} />
              </button>
              {story && (
                <img
                  src={story.slides[currentSlide].mediaSrc}
                  alt={story.slides[currentSlide].heading}
                  className="story-image"
                />
              )}
              <div className="story-content">
                <h2>{story?.slides[currentSlide].heading}</h2>
                <p>{story?.slides[currentSlide].description}</p>
              </div>
              <div className="story-actions">
                <button
                  className="story-actions-btn"
                  onClick={() =>
                    toggleBookMarkSlide(
                      story._id,
                      story.slides[currentSlide]._id
                    )
                  }
                  disabled={bookmarkAndLikeLoading}
                >
                  <FaBookmark
                    size={20}
                    color={isBookmarked ? "blue" : "white"}
                  />
                </button>
                <button
                  className="action-btn"
                  onClick={() =>
                    toggleLikeSlide(story._id, story.slides[currentSlide]._id)
                  }
                >
                  <FaHeart size={24} color={isLiked ? "red" : "white"} />{" "}
                  {slideLikes}
                </button>
              </div>
            </div>
            <button className="nav-btn prev" onClick={handlePrevSlide}>
              ❮
            </button>
            <button className="nav-btn next-slide" onClick={handleNextSlide}>
              ❯
            </button>
          </>
        )}
      </div>
    </div>
  );
}