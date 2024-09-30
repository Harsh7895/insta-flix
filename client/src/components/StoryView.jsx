import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom"; // Import React Router hooks
import "../styles/story.css";
import { useDispatch, useSelector } from "react-redux";
import { FaBookmark, FaHeart } from "react-icons/fa";
import { IoPaperPlaneOutline } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";
import { MdDownloadDone } from "react-icons/md";
import { signInSuccess } from "../../redux/user/userSlice";

const api_url = "https://insta-flix-api.vercel.app/api/v1";

{
  /* eslint-disable */
}
export default function StoryViewer({
  storyId,
  slideId,
  onClose,
  showLoginPage,
}) {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [slideLikes, setSlideLikes] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams(); // React Router hook to handle query params
  const [bookmarkAndLikeLoading, setBookmarkAndLikeLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const videoRef = useRef(null);

  // Fetch story data when component mounts or params change
  useEffect(() => {
    document.body.classList.add("no-scroll");
    setSearchParams({
      storyId,
      slideId,
    });
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
      setIsBookmarked(false);

      if (currentUser?.bookmarks && story?.slides?.[currentSlide]) {
        const bookmarkStory = currentUser.bookmarks.find(
          (bookmark) => bookmark.storyId === storyId
        );

        if (bookmarkStory) {
          const isCurrentSlideBookmarked = bookmarkStory.slides.includes(
            story.slides[currentSlide]._id
          );

          setIsBookmarked(isCurrentSlideBookmarked);
        }
      }
    };

    const checkLiked = () => {
      setIsLiked(false);

      if (currentUser?.likes && story?.slides?.[currentSlide]) {
        const likedStory = currentUser.likes.find(
          (bookmark) => bookmark.storyId === storyId
        );

        if (likedStory) {
          const isCurrentLikedStory = likedStory.slides.includes(
            story.slides[currentSlide]._id
          );

          setIsLiked(isCurrentLikedStory);
        }
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [currentSlide]);

  useEffect(() => {
    if (videoRef.current && story) {
      if (story.slides[currentSlide].mediaType === "video") {
        videoRef.current.play().catch((error) => {
          console.log("Video play failed: ", error); // Log for debugging
        });
      }
    }
  }, [currentSlide, story]);

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
      setIsDownloaded(false);
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

      setIsDownloaded(false);
    }
  };

  const toggleBookMarkSlide = async (storyId, slideId) => {
    if (!currentUser) {
      onClose();
      showLoginPage();
      setSearchParams({});
      return;
    }
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
    if (!currentUser) {
      onClose();
      showLoginPage();
      setSearchParams({});
      return;
    }
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
        console.log(data);
        toast.error(data.message);
        setSlideLikes(currentLikes);
        setIsLiked(currIsLiked);
        return;
      }
      setIsLiked(data.isLiked);

      dispatch(signInSuccess({ token: currentUser.token, ...data.rest }));
    } catch (error) {
      console.log(error);
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
      setIsShared(true);
      setTimeout(() => {
        setIsShared(false);
      }, 2300);
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  const downloadMedia = () => {
    fetch(story.slides[currentSlide].mediaSrc)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download =
          story.slides[currentSlide].mediaType === "image"
            ? `${story.slides[currentSlide].mediaType}.jpg`
            : `${story.slides[currentSlide].mediaType}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setIsDownloaded(true);
      })
      .catch((error) => toast.error("Error downloading media:", error));
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
              <button
                className="close-btn"
                onClick={() => {
                  onClose();
                  setSearchParams();
                }}
              >
                ✕
              </button>
              <button className="share-btn" onClick={copyToClipboard}>
                <IoPaperPlaneOutline size={20} />
              </button>
              {story && story.slides[currentSlide].mediaType === "image" && (
                <img
                  src={story.slides[currentSlide].mediaSrc}
                  alt={story.slides[currentSlide].heading}
                  className="story-image"
                />
              )}
              {story && story.slides[currentSlide].mediaType === "video" && (
                <video
                  src={story.slides[currentSlide].mediaSrc}
                  className="story-image"
                  controls={false}
                  autoPlay
                  loop
                  muted
                  ref={videoRef}
                ></video>
              )}
              <div className="story-content">
                {isShared && <p id="copiedLink">Link Copied to Clipboard</p>}
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
                  className="story-actions-btn"
                  disabled={isDownloaded}
                  onClick={downloadMedia}
                >
                  {isDownloaded ? (
                    <MdDownloadDone color="white" size={24} />
                  ) : (
                    <IoMdDownload color="white" size={24} />
                  )}
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

            <div className="prev-slide-mob" onClick={handlePrevSlide}>
              .
            </div>
            <div className="next-slide-mob " onClick={handleNextSlide}>
              .
            </div>
          </>
        )}
      </div>
    </div>
  );
}
