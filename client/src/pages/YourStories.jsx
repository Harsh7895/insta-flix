import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import SlideCard from "../components/SlideCard";
import StoryViewer from "../components/StoryView";
import LoginPopup from "../components/LoginPopup";
import "../styles/bookmark.css";

const api_url = "https://insta-flix-api.vercel.app/api/v1/story";

const YourStories = () => {
  const [yourStories, setYourStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [isStoryViewerOpen, setStoryViewerOpen] = useState(false);
  const [showLoginIfNot, setShowLoginIfNot] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchYourStories = async () => {
      if (!currentUser) {
        setLoading(false); // Stop loading if not logged in
        return;
      }
      try {
        const res = await fetch(`${api_url}/get-user-story?all=true`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.message);
        } else {
          setYourStories(data.stories);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching your stories.");
      } finally {
        setLoading(false);
      }
    };

    fetchYourStories();
  }, [currentUser]);

  const openStoryViewer = (storyId, slideId) => {
    setSelectedStory(storyId);
    setSelectedSlide(slideId);
    setStoryViewerOpen(true);
  };

  const closeStoryViewer = () => {
    setStoryViewerOpen(false);
    setSelectedStory(null);
    setSelectedSlide(null);
  };

  return (
    <>
      <div className="bookmark-container">
        <h2>Your Stories</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {yourStories.length > 0 ? (
              <div>
                {yourStories.map((story, indx) => (
                  <SlideCard
                    key={indx}
                    mediaSrc={story.slides[0]?.mediaSrc} // Ensure there's a media source
                    mediaType={story.slides[0]?.mediaType}
                    description={story.slides[0]?.description}
                    heading={story.slides[0]?.heading}
                    storyId={story._id}
                    slideId={story.slides[0]?._id}
                    onOpenStoryViewer={openStoryViewer}
                    showEdit={true}
                  />
                ))}
              </div>
            ) : (
              <p>No bookmarked stories found.</p>
            )}
          </>
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

export default YourStories;
