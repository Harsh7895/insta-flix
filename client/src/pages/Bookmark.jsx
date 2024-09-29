import { useSelector } from "react-redux";
import "../styles/bookmark.css";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SlideCard from "../components/SlideCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import StoryViewer from "../components/StoryView";
import LoginPopup from "../components/LoginPopup";

const api_url =
  "https://insta-flix-api.vercel.app/api/v1/story/get-allbookmarked-stories";

{
  /* eslint-disable */
}
const Bookmark = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookmarks, setBookmarks] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [isStoryViewerOpen, setStoryViewerOpen] = useState(false);
  const [showLoginIfNot, setShowLoginIfNot] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getBookmarks = async () => {
      try {
        setLoading(true);
        const res = await fetch(api_url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        });

        const data = await res.json();
        if (!data.success) {
          toast.error(data.message);
          return;
        }

        setBookmarks(data.bookmarkedStories);
      } catch (error) {
        console.log(error);
        toast.error("Error fetching bookmarks.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      getBookmarks();
    }
  }, [currentUser]);

  const openStoryViewer = (storyId, slideId) => {
    setSelectedStory(storyId);
    setSelectedSlide(slideId);
    setStoryViewerOpen(true);

    setSearchParams({ storyId, slideId });
  };

  const closeStoryViewer = () => {
    setStoryViewerOpen(false);
    setSearchParams({});
  };

  return (
    <>
      <div className="bookmark-container">
        <h2>Your BookMarks</h2>

        <div>
          {bookmarks &&
            bookmarks.length > 0 &&
            bookmarks.map((story, indx) => (
              <SlideCard
                key={indx}
                mediaSrc={story.slides[0]?.mediaSrc} // Handle case where slides might be empty
                mediaType={story.slides[0]?.mediaType}
                description={story.slides[0]?.description}
                heading={story.slides[0]?.heading}
                storyId={story._id}
                slideId={story.slides[0]?._id}
                onOpenStoryViewer={openStoryViewer}
              />
            ))}
        </div>
        {(!bookmarks || bookmarks.length < 1) && (
          <p>
            {loading ? (
              "Loading...."
            ) : (
              <>
                No Bookmarks found.{" "}
                <span onClick={() => navigate("/")}>Back to Home</span>
              </>
            )}
          </p>
        )}
      </div>

      {isStoryViewerOpen && (
        <StoryViewer
          storyId={selectedStory}
          slideId={selectedSlide}
          onClose={closeStoryViewer}
          showLoginPage={() => setShowLoginIfNot(true)}
        />
      )}

      {showLoginIfNot && (
        <LoginPopup
          onClose={() => setShowLoginIfNot(false)}
          loginOrRegister={"login"}
        />
      )}
    </>
  );
};

export default Bookmark;
