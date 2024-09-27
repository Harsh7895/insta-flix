import { useEffect, useState } from "react";
import "../styles/home.css";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import SlideCard from "../components/SlideCard";
import StoryViewer from "../components/StoryView.jsx"; // Import StoryViewer
import { useSearchParams } from "react-router-dom"; // Import React Router hooks
import LoginPopup from "../components/LoginPopup.jsx";

const api_url = "http://localhost:3000/api/v1/story/get-user-story";

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

const Home = () => {
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yourStory, setYourStory] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null); // New state for the selected story
  const [selectedSlide, setSelectedSlide] = useState(null); // New state for the selected slide
  const [isStoryViewerOpen, setStoryViewerOpen] = useState(false); // State to control StoryViewer modal visibility
  const [showLoginIfNot, setShowLoginIfNot] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const [searchParams, setSearchParams] = useSearchParams(); // React Router hook for search params

  const handleSelect = (item) => {
    if (active.includes(item)) {
      setActive(active.filter((category) => category !== item));
    } else {
      setActive([...active, item]);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const getStory = async () => {
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
          } else {
            setYourStory(data.stories);
          }
        } catch (error) {
          console.log(error);
          toast.error("Error fetching story.");
        } finally {
          setLoading(false);
        }
      };

      getStory();
    }

    if (!currentUser) setYourStory(null);
  }, [currentUser]);

  // Function to open the story viewer modal
  const openStoryViewer = (storyId, slideId) => {
    setSelectedStory(storyId);
    setSelectedSlide(slideId);
    setStoryViewerOpen(true);

    // Update the URL with query parameters using React Router's setSearchParams
    setSearchParams({ storyId, slideId });
  };

  const closeStoryViewer = () => {
    setStoryViewerOpen(false);

    // Clear query parameters when closing the StoryViewer
    setSearchParams({});
  };

  // Read query parameters on page load
  useEffect(() => {
    const storyIdFromUrl = searchParams.get("storyId");
    const slideIdFromUrl = searchParams.get("slideId");

    if (storyIdFromUrl && slideIdFromUrl) {
      openStoryViewer(storyIdFromUrl, slideIdFromUrl);
    }
  }, [searchParams]);

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

      {yourStory && (
        <>
          <h2>Your Stories</h2>
          <div className="stories-grid">
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
        </>
      )}
      <h2>Top Stories About food</h2>
      <div className="stories-grid">
        <div className="no-stories">No Stories Available</div>
      </div>

      <button className="see-more-btn">See more</button>

      <h2>Top Stories About food</h2>
      <div className="stories-grid">
        {[1, 2, 3, 4].map((item) => (
          <SlideCard
            key={item}
            heading={"Heading comes here"}
            description={
              "Inspirational designs, illustrations, and graphic elements from the world's best designers"
            }
            mediaSrc={
              "https://th.bing.com/th?id=OIP.Fw-199hoU0qcuFHEL9Vf8wHaLH&w=204&h=306&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2"
            }
            mediaType={"image"}
          />
        ))}
      </div>

      {/* Add the StoryViewer as an overlay */}
      {isStoryViewerOpen && (
        <StoryViewer
          storyId={selectedStory}
          slideId={selectedSlide}
          onClose={closeStoryViewer} // Close the viewer
          showLoginPage={() => setShowLoginIfNot(true)}
        />
      )}

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
