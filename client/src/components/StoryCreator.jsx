import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import "../styles/storyCreator.css"; // Assuming your CSS is in this path
import { useNavigate } from "react-router-dom";

const API_URL = "https://insta-flix-api.vercel.app/api/v1/story";

{
  /* eslint-disable */
}
export default function StoryCreator({ onClose, storyId = null }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [slides, setSlides] = useState([1, 2, 3, 4]);
  const [slideData, setSlideData] = useState(
    Array.from({ length: 4 }, () => ({
      heading: "",
      description: "",
      mediaSrc: "",
      mediaType: "",
    }))
  );
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate("/");

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  useEffect(() => {
    if (storyId) {
      const fetchStory = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${API_URL}/get-story`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: storyId }),
          });
          const data = await res.json();
          if (data.success) {
            const initialSlides = data.story.slides || [];
            setSlides(initialSlides.map((_, idx) => idx + 1)); // Update slide count
            setSlideData(
              initialSlides.map((slide) => ({
                heading: slide.heading || "",
                description: slide.description || "",
                mediaSrc: slide.mediaSrc || "",
                mediaType: slide.mediaType || "", // Ensure mediaType is included
              }))
            );
            setCategory(data.story.category || "");
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error("Error fetching story.");
        } finally {
          setLoading(false);
        }
      };

      fetchStory();
    } else {
      // Reset for new story creation
      setSlideData(
        Array.from({ length: 4 }, () => ({
          heading: "",
          description: "",
          mediaSrc: "",
          mediaType: "",
        }))
      );
    }
  }, [storyId]);

  const detectMediaType = async (url) => {
    const videoExtensions = ["mp4", "webm", "ogg"];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "tiff"];

    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("Content-Type");

      // If Content-Type is available, use it
      if (contentType) {
        if (contentType.startsWith("video/")) {
          return "video";
        } else if (contentType.startsWith("image/")) {
          return "image";
        }
      }
    } catch (error) {
      console.warn("Could not fetch Content-Type:", error);
    }

    // Fallback to checking the URL extension
    const extension = url.split(".").pop().split(/\?|#/)[0].toLowerCase();
    if (videoExtensions.includes(extension)) {
      return "video";
    } else if (imageExtensions.includes(extension)) {
      return "image";
    } else {
      return null;
    }
  };

  const handleChange = async (e, slideIndex, field) => {
    const value = e.target.value;
    const updatedSlides = [...slideData];

    updatedSlides[slideIndex][field] = value;

    if (field === "mediaSrc") {
      const mediaType = await detectMediaType(value);
      updatedSlides[slideIndex].mediaType = mediaType;
    }

    setSlideData(updatedSlides);
  };

  const validateSlides = () => {
    const errors = [];
    slideData.forEach((slide, index) => {
      const slideErrors = [];
      if (!slide.heading) slideErrors.push("heading");
      if (!slide.description) slideErrors.push("description");
      if (!slide.mediaSrc || !slide.mediaType)
        slideErrors.push(" Incorrect or Invalid mediaSrc");

      if (slideErrors.length) {
        errors.push({ slideNumber: index + 1, errors: slideErrors });
      }
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateSlides();
    if (errors.length) {
      const errorMessages = errors
        .map(
          ({ slideNumber, errors }) =>
            `Slide ${slideNumber} is missing the following fields: ${errors.join(
              ", "
            )}`
        )
        .join("\n");
      toast.error(errorMessages);
      return;
    }

    const dataToSend = {
      slides: slideData,
      category,
    };

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/${storyId ? "update-story" : "create-story"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({
            ...(storyId && { id: storyId }), // Include storyId for update
            ...dataToSend,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(storyId ? "Story updated" : "Story uploaded");
        onClose();
        navigate("/");
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Error uploading story");
    } finally {
      setLoading(false);
    }
  };

  const addSlide = () => {
    if (slides.length < 6) {
      setSlides((prev) => [...prev, prev.length + 1]);
      setSlideData((prev) => [
        ...prev,
        { heading: "", description: "", mediaSrc: "", mediaType: "" },
      ]);
    }
  };

  const removeSlide = (slideNumber) => {
    if (slides.length > 3) {
      setSlides((prev) => prev.filter((slide) => slide !== slideNumber));
      setSlideData((prev) => prev.filter((_, idx) => idx !== slideNumber - 1));
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 1) setCurrentSlide((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentSlide < slides.length) setCurrentSlide((prev) => prev + 1);
  };

  return (
    <div className="story-creator">
      <form className="modal" onSubmit={handleSubmit}>
        <h2 className="add-story-heading">Add story to feed</h2>
        <button className="close-button" onClick={onClose} type="button">
          <img src="/Vector.jpg" alt="Close" />
        </button>
        <p className="slide-limit">Add up to 6 slides</p>
        <div className="slide-form-container">
          <div className="slide-tabs">
            {slides.map((slide) => (
              <button
                key={slide}
                className={`slide-tab ${
                  currentSlide === slide ? "active" : ""
                }`}
                onClick={() => setCurrentSlide(slide)}
                type="button"
              >
                Slide {slide}
                {slide > 3 && (
                  <img
                    src="/Vector.jpg"
                    alt="Remove slide"
                    onClick={() => removeSlide(slide)}
                    className="slide-close-btn"
                  />
                )}
              </button>
            ))}
            {slides.length < 6 && (
              <button className="add-slide" onClick={addSlide} type="button">
                Add +
              </button>
            )}
          </div>
          <div className="form-groups-container">
            <div className="form-group">
              <label htmlFor="heading">Heading :</label>
              <input
                type="text"
                id="heading"
                placeholder="Your heading"
                value={slideData[currentSlide - 1]?.heading || ""}
                onChange={(e) => handleChange(e, currentSlide - 1, "heading")}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description :</label>
              <textarea
                id="description"
                placeholder="Story Description"
                value={slideData[currentSlide - 1]?.description || ""}
                onChange={(e) =>
                  handleChange(e, currentSlide - 1, "description")
                }
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="mediaSrc">Media :</label>
              <input
                type="text"
                id="mediaSrc"
                placeholder="Add image/video URL"
                value={slideData[currentSlide - 1]?.mediaSrc || ""}
                onChange={(e) => handleChange(e, currentSlide - 1, "mediaSrc")}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category :</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="medical">Medical</option>
                <option value="fruits">Fruits</option>
                <option value="world">World</option>
                <option value="india">India</option>
              </select>
            </div>
          </div>
        </div>
        <div className="button-group">
          <div>
            <button className="previous" onClick={handlePrevious} type="button">
              Previous
            </button>
            <button className="next" onClick={handleNext} type="button">
              Next
            </button>
          </div>
          <button className="post" type="submit" disabled={loading}>
            {loading
              ? storyId
                ? "Editing..."
                : "Posting..."
              : storyId
              ? "Edit"
              : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
