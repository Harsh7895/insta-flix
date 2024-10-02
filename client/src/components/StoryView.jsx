import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom"; // Import React Router hooks
import "../styles/story.css";
import { useDispatch, useSelector } from "react-redux";
import { FaBookmark, FaHeart } from "react-icons/fa";
import { IoPaperPlaneOutline } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";
import { MdDownloadDone } from "react-icons/md";
import { signInSuccess } from "../../redux/user/userSlice";
import { formatWordsSpace } from "../utils/util";

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
  const navigate = useNavigate();

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
          setSlideLikes(data.story?.slides[currentSlide].likeCount);
          console.log(slideLikes);
        }
      } catch (error) {
        toast.error("Error fetching story.");
        navigate("/");
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
      setSlideLikes(story.sldies?.[newSlideIndex].likeCount);
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
      setSlideLikes(story.slides?.[newSlideIndex]?.likeCount);
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
      setSearchParams({});
      showLoginPage();
      onClose();
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
      const updatedStory = { ...story };
      updatedStory.slides[currentSlide].likeCount =
        updatedStory.slides[currentSlide].likeCount + (data.isLiked ? 1 : -1);

      setStory(updatedStory);
      setSlideLikes(story.slides[currentSlide].likeCount);
      dispatch(signInSuccess({ token: currentUser.token, ...data.rest }));
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setBookmarkAndLikeLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
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
          <p className="story-container ">
            <span className="story-container-loading">Loading...</span>
          </p>
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
                  controlsList="nofullscreen"
                  disablePictureInPicture
                  disableRemotePlayback
                  unselectable="controls"
                  ref={videoRef}
                  poster="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/45148b8a-5dc4-4263-8612-ada44c29cbc7/deda14r-67a63673-9408-417a-b40b-6fa693e5fa56.jpg/v1/fill/w_686,h_1165,q_70,strp/instagram_loading__by_azabelabigail_deda14r-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTM3MiIsInBhdGgiOiJcL2ZcLzQ1MTQ4YjhhLTVkYzQtNDI2My04NjEyLWFkYTQ0YzI5Y2JjN1wvZGVkYTE0ci02N2E2MzY3My05NDA4LTQxN2EtYjQwYi02ZmE2OTNlNWZhNTYuanBnIiwid2lkdGgiOiI8PTgwOCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.tdKS9SIhUwxGJSh4TPUOu1J6O-BKhRc2pUVMBrdzFHk"
                ></video>
              )}
              <div className="story-content">
                {isShared && <p id="copiedLink">Link Copied to Clipboard</p>}
                <h2>
                  {formatWordsSpace(
                    story?.slides[currentSlide]?.heading || "",
                    30
                  )}
                </h2>
                <p>
                  {formatWordsSpace(
                    story?.slides[currentSlide]?.description || "",
                    100
                  )}
                </p>
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
