import { useEffect, useState } from "react";
import "../styles/home.css";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import SlideCard from "../components/SlideCard";
import StoryViewer from "../components/StoryView.jsx";
import LoginPopup from "../components/LoginPopup.jsx";

const api_url = "http://localhost:3000/api/v1/story";

const categories = [
  {
    id: 1,
    imgSrc: "/all.png",
    name: "All",
  },
  {
    id: 2,
    imgSrc: "/medicine.png",
    name: "Medical",
  },
  {
    id: 3,
    imgSrc: "/fruits.png",
    name: "Fruits",
  },
  {
    id: 4,
    imgSrc: "/world.png",
    name: "World",
  },
  {
    id: 5,
    imgSrc: "/india.png",
    name: "India",
  },
];

{
  /* eslint-disable */
}

const Home = () => {
  const [yourStory, setYourStory] = useState(null);
  const [storiesByCategory, setStoriesByCategory] = useState({});
  const [pageByCategory, setPageByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState([]); // State for active categories
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [isStoryViewerOpen, setStoryViewerOpen] = useState(false);
  const [showLoginIfNot, setShowLoginIfNot] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const handleSelect = (category) => {
    if (active.includes(category)) {
      setActive(active.filter((cat) => cat !== category));
    } else {
      setActive([...active, category]);
    }
  };

  const fetchYourStories = async () => {
    if (currentUser) {
      try {
        setLoading(true);
        const res = await fetch(`${api_url}/get-user-story`, {
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
          setYourStory(data.stories);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching your stories.");
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchCategoryStories = async (category, page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${api_url}/get-storyby-category?category=${category}&limit=4&page=${page}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message);
      } else {
        setStoriesByCategory((prevStories) => {
          const currentStories = prevStories[category] || [];

          const uniqueNewStories = data.stories.filter(
            (newStory) =>
              !currentStories.some((story) => story._id === newStory._id)
          );

          return {
            ...prevStories,
            [category]: [...currentStories, ...uniqueNewStories],
          };
        });

        setPageByCategory((prevPage) => ({
          ...prevPage,
          [category]: page,
        }));
      }
    } catch (error) {
      toast.error("Error fetching stories for category.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreStories = (category) => {
    const nextPage = (pageByCategory[category] || 1) + 1;

    fetchCategoryStories(category, nextPage);
  };

  const openStoryViewer = (storyId, slideId) => {
    setSelectedStory(storyId);
    setSelectedSlide(slideId);
    setStoryViewerOpen(true);
  };

  const closeStoryViewer = () => {
    setStoryViewerOpen(false);
  };

  const fetchInitialStories = () => {
    categories.forEach((category) => fetchCategoryStories(category.name, 1));
  };

  useEffect(() => {
    if (currentUser) {
      fetchYourStories();
    }
    fetchInitialStories();
  }, []);

  return (
    <div className="app">
      <div className="categories">
        {categories.map((category) => (
          <div
            className="category-item"
            key={category.id}
            onClick={() => handleSelect(category.name)}
            id={active.includes(category.name) ? "active-category" : ""}
          >
            <img src={category.imgSrc} alt={category.name} />
            <span>{category.name}</span>
          </div>
        ))}
      </div>

      {/* Your Stories Section */}
      {currentUser && yourStory && yourStory.length > 0 && (
        <>
          <h2 className="your-stories">Your Stories</h2>
          <div className="stories-grid your-stories">
            {yourStory.map((story, indx) => (
              <SlideCard
                key={indx}
                mediaSrc={story.slides[0].mediaSrc}
                mediaType={story.slides[0].mediaType}
                description={story.slides[0].description}
                heading={story.slides[0].heading}
                storyId={story._id}
                slideId={story.slides[0]._id}
                onOpenStoryViewer={openStoryViewer}
              />
            ))}
          </div>
        </>
      )}

      {/* Stories by Category */}
      {categories.map((category) => (
        <div key={category.id}>
          <h2>Top Stories About {category.name}</h2>
          <div className="stories-grid">
            {/* Check if stories are available for the category */}
            {storiesByCategory[category.name] &&
            storiesByCategory[category.name].length > 0 ? (
              storiesByCategory[category.name].map((story, indx) => (
                <SlideCard
                  key={indx}
                  mediaSrc={story.slides[0].mediaSrc}
                  mediaType={story.slides[0].mediaType}
                  description={story.slides[0].description}
                  heading={story.slides[0].heading}
                  storyId={story._id}
                  slideId={story.slides[0]._id}
                  onOpenStoryViewer={openStoryViewer}
                />
              ))
            ) : (
              <div className="no-stories">No Stories Available</div>
            )}
          </div>
          {storiesByCategory[category.name] &&
            storiesByCategory[category.name].length > 0 && (
              <button
                className="see-more-btn"
                onClick={() => loadMoreStories(category.name)}
              >
                See more
              </button>
            )}
        </div>
      ))}

      {/* Story Viewer Modal */}
      {isStoryViewerOpen && (
        <StoryViewer
          storyId={selectedStory}
          slideId={selectedSlide}
          onClose={closeStoryViewer}
          showLoginPage={() => setShowLoginIfNot(true)}
        />
      )}

      {/* Login Popup */}
      {showLoginIfNot && (
        <LoginPopup
          onClose={() => setShowLoginIfNot(false)}
          loginOrRegister={"login"}
        />
      )}
    </div>
  );
};

export default Home;
