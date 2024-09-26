import { useEffect, useState } from "react";
import "../styles/storyCreator.css";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

const API_URL = "http://localhost:3000/api/v1/story/create-story";

{
  /* eslint-disable */
}
export default function StoryCreator({ onClose }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [slides, setSlides] = useState([1, 2, 3, 4]);
  const [slideData, setSlideData] = useState(
    Array.from({ length: 4 }, () => ({
      heading: "",
      description: "",
      mediaSrc: "",
      mediaType: "", // Added field for media type
    }))
  );
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  const { currentUser } = useSelector((state) => state.user);

  const addSlide = () => {
    if (slides.length < 6) {
      setSlides([...slides, slides.length + 1]);
      setSlideData((prevData) => [
        ...prevData,
        { heading: "", description: "", mediaSrc: "", mediaType: "" },
      ]);
      setCurrentSlide(slides.length + 1);
    }
  };

  const removeSlide = (slideNumber) => {
    if (slides.length > 3) {
      setSlides((prevSlides) =>
        prevSlides.filter((_, index) => index !== slideNumber - 1)
      );

      setSlideData((prevData) =>
        prevData.filter((_, index) => index !== slideNumber - 1)
      );

      if (currentSlide === slideNumber) {
        setCurrentSlide((prevSlide) => Math.max(1, prevSlide - 1));
      }
    }
  };

  const detectMediaType = async (url) => {
    const videoExtensions = ["mp4", "webm", "ogg"];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];

    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("Content-Type");

      if (contentType) {
        if (contentType.startsWith("video/")) {
          return "video";
        } else if (contentType.startsWith("image/")) {
          return "image";
        }
      }

      const extension = url.split(".").pop().toLowerCase();
      if (videoExtensions.includes(extension)) {
        return "video";
      } else if (imageExtensions.includes(extension)) {
        return "image";
      } else {
        return null;
      }
    } catch (error) {
      throw new Error("Invalid media URL or CORS issue");
    }
  };

  const checkMediaDuration = async (url) => {
    return new Promise((resolve, reject) => {
      detectMediaType(url)
        .then((mediaType) => {
          if (mediaType === "video") {
            const media = document.createElement("video");
            media.src = url;

            media.onloadedmetadata = () => {
              if (media.duration >= 20) {
                reject("Video exceeds 15 seconds");
              } else {
                resolve("video");
              }
            };

            media.onerror = () => {
              reject("Invalid video URL or CORS issue");
            };
          } else if (mediaType === "image") {
            resolve("image");
          } else {
            reject("Unsupported media type");
          }
        })
        .catch((error) => reject(error.message));
    });
  };

  const handleChange = async (e, index, field) => {
    const { value } = e.target;

    setSlideData((prevData) => {
      if (!prevData[index]) {
        setCurrentSlide(1);
        return prevData;
      }

      const newData = [...prevData];
      newData[index][field] = value;

      // Automatically detect and set media type if changing mediaSrc
      if (field === "mediaSrc") {
        checkMediaDuration(value)
          .then((mediaType) => {
            newData[index].mediaType = mediaType;
            setSlideData(newData); // Update the state
          })
          .catch((error) => {
            newData[index].mediaType = ""; // Reset if there's an error
            toast.error(error); // Show the error message
          });
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (!currentUser?.token) {
      toast.error("You must be logged in to create a story");
      return;
    }

    if (loading) return;
    const relevantSlides = slideData.slice(0, slides.length);

    // Validate slides
    const missingFields = relevantSlides
      .map((slide, index) => {
        const slideNumber = index + 1;
        const errors = [];
        if (!slide.heading) errors.push("heading");
        if (!slide.description) errors.push("description");
        if (!slide.mediaSrc) errors.push("media");
        if (!slide.mediaType) errors.push("valid media type");
        return errors.length ? { slideNumber, errors } : null;
      })
      .filter(Boolean);

    if (missingFields.length) {
      const errorMessages = missingFields
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
      slides: relevantSlides,
      category,
    };

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Story uploaded");
        onClose();
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Error uploading story");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 1) setCurrentSlide(currentSlide - 1);
  };
  const handleNext = () => {
    if (currentSlide < slides.length) setCurrentSlide(currentSlide + 1);
  };

  console.log(slideData[currentSlide - 1].mediaType);

  return (
    <div className="story-creator">
      <form className="modal" onSubmit={handleSubmit}>
        <button className="close-button" onClick={onClose} type="button">
          <img src="/Vector.jpg" alt="x" />
        </button>
        <p className="slide-limit">Add up to 6 slides</p>
        <div className="slide-tabs">
          {slides.map((slide) => (
            <button
              key={slide}
              className={`slide-tab ${currentSlide === slide ? "active" : ""}`}
              onClick={() => setCurrentSlide(slide)}
              type="button"
            >
              Slide {slide}
              {slide > 3 && (
                <img
                  src="/Vector.jpg"
                  alt="x"
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
            onChange={(e) => handleChange(e, currentSlide - 1, "description")}
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
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
