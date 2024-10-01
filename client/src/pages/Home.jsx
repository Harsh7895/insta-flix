import { useEffect, useState } from "react";
import "../styles/home.css";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import SlideCard from "../components/SlideCard";
import StoryViewer from "../components/StoryView.jsx";
import LoginPopup from "../components/LoginPopup.jsx";
import { useSearchParams } from "react-router-dom";

const api_url = "https://insta-flix-api.vercel.app/api/v1/story";

const categories = [
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

const allCategory = {
  id: 1,
  imgSrc: "/all.png",
  name: "All",
};

{
  /*eslint-disable*/
}
const Home = () => {
  const [yourStory, setYourStory] = useState([]);
  const [storiesByCategory, setStoriesByCategory] = useState({});
  const [pageByCategory, setPageByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([
    allCategory.name,
  ]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [isStoryViewerOpen, setStoryViewerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [showLoginIfNot, setShowLoginIfNot] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  // New state for pagination
  const [yourStoriesPage, setYourStoriesPage] = useState(1);
  const [yourStoriesHasMore, setYourStoriesHasMore] = useState(true);

  // Handle category selection
  const handleSelect = (category) => {
    if (category === "All") {
      setSelectedCategories([category]); // Clear other selections and show all
    } else {
      setSelectedCategories((prev) => {
        if (prev.includes("All")) {
          return [category]; // Remove "All" when selecting a specific category
        }
        if (prev.includes(category)) {
          return prev.filter((cat) => cat !== category); // Deselect category
        }
        if (prev.length < 4) {
          return [...prev, category];
        }
        return prev;
      });
    }
  };

  // Fetch user stories with pagination
  const fetchYourStories = async (page = 1) => {
    if (currentUser) {
      try {
        setLoading(true);
        const res = await fetch(`${api_url}/get-user-story?page=${page}`, {
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
          setYourStory((prev) => [...prev, ...data.stories]);
          setYourStoriesHasMore(data.totalStories > 4 * page);
        }
      } catch (error) {
        toast.error("Error fetching your stories.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch stories by category with pagination
  const fetchCategoryStories = async (category, page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${api_url}/get-storyby-category?category=${category}&page=${page}&limit=4`,
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

        // Check if there are more stories to load
        setPageByCategory((prevPage) => ({
          ...prevPage,
          [`${category}_hasMore`]: data.totalStories > 4 * page,
          [category]: page,
        }));
      }
    } catch (error) {
      toast.error("Error fetching stories for category.");
    } finally {
      setLoading(false);
    }
  };

  // Load more stories when "See more" button is clicked
  const loadMoreYourStories = () => {
    const nextPage = yourStoriesPage + 1;
    setYourStoriesPage(nextPage);
    fetchYourStories(nextPage);
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

  useEffect(() => {
    const storyId = searchParams.get("storyId");
    const slideId = searchParams.get("slideId");

    if (storyId && slideId) {
      setSelectedStory(storyId);
      setSelectedSlide(slideId);
      setStoryViewerOpen(true);
    }
  }, [searchParams]);

  const closeStoryViewer = () => {
    setStoryViewerOpen(false);
  };

  const fetchInitialStories = () => {
    categories.forEach((category) => fetchCategoryStories(category.name, 1));
  };

  useEffect(() => {
    if (currentUser) {
      fetchYourStories(yourStoriesPage); // Fetch user's stories on load
    }
    fetchInitialStories();
  }, [currentUser]);

  return (
    <div className="app">
      <div className="categories">
        {[allCategory, ...categories].map((category) => (
          <div
            className="category-item"
            key={category.id}
            onClick={() => handleSelect(category.name)}
            id={
              selectedCategories.includes(category.name)
                ? "active-category"
                : ""
            }
          >
            <img src={category.imgSrc} alt={category.name} />
            <a href={`#${category.name}`}>{category.name}</a>
          </div>
        ))}
      </div>

      {/* Your Stories Section */}
      {currentUser && yourStory.length > 0 && (
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
                showEdit={true}
              />
            ))}
          </div>
          {yourStoriesHasMore && (
            <button className="see-more-btn" onClick={loadMoreYourStories}>
              See More
            </button>
          )}
        </>
      )}

      {/* Stories by Selected Categories */}
      {selectedCategories.includes("All")
        ? categories.map((category) => (
            <div key={category.id}>
              <h2>Top Stories About {category.name}</h2>
              <div className="stories-grid">
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
                  <div className="no-stories">
                    {loading ? "Loading ..." : "No Stories Available"}
                  </div>
                )}
              </div>
              {storiesByCategory[category.name] &&
                storiesByCategory[category.name].length >= 4 &&
                pageByCategory[`${category.name}_hasMore`] && (
                  <button
                    className="see-more-btn"
                    onClick={() => loadMoreStories(category.name)}
                  >
                    See more
                  </button>
                )}
            </div>
          ))
        : selectedCategories.map((categoryName, indx) => (
            <div key={indx}>
              <h2 id={categoryName}>Top Stories About {categoryName}</h2>
              <div className="stories-grid">
                {storiesByCategory[categoryName] &&
                storiesByCategory[categoryName].length > 0 ? (
                  storiesByCategory[categoryName].map((story, indx) => (
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
                  <div className="no-stories">
                    {loading ? "Loading ..." : "No Stories Available"}
                  </div>
                )}
              </div>
              {storiesByCategory[categoryName] &&
                storiesByCategory[categoryName].length >= 4 &&
                pageByCategory[`${categoryName}_hasMore`] && (
                  <button
                    className="see-more-btn"
                    onClick={() => loadMoreStories(categoryName)}
                  >
                    See more
                  </button>
                )}
            </div>
          ))}

      {/* Story Viewer */}
      {isStoryViewerOpen && (
        <StoryViewer
          storyId={selectedStory}
          slideId={selectedSlide}
          onClose={closeStoryViewer}
        />
      )}

      {/* Login Popup */}
      {!currentUser && showLoginIfNot && (
        <LoginPopup onClose={() => setShowLoginIfNot(false)} />
      )}
    </div>
  );
};

export default Home;
