import { useState } from "react";
import "../styles/slidecard.css";
import { BiEdit } from "react-icons/bi";
import StoryCreator from "./StoryCreator";
import { formatWordsSpace } from "../utils/util";

{
  /* eslint-disable */
}
const SlideCard = ({
  heading,
  description,
  mediaSrc,
  mediaType,
  storyId = "",
  slideId = "",
  onOpenStoryViewer,
  showEdit = false,
}) => {
  const [showStoryEditForm, setShowStoryEditForm] = useState(false);
  return (
    <div className="story-card">
      {mediaType === "image" ? (
        <img
          src={mediaSrc}
          alt="Story"
          onClick={() => onOpenStoryViewer(storyId, slideId)}
        />
      ) : (
        <video
          src={mediaSrc}
          onClick={() => onOpenStoryViewer(storyId, slideId)}
          height={"550px"}
          width={"267px"}
        ></video>
      )}
      <div
        className="story-description"
        style={{ bottom: showEdit ? "20px" : "0" }}
      >
        <h3>{formatWordsSpace(heading, 30)}</h3>
        <p>{formatWordsSpace(description, 70)}</p>
      </div>

      {showEdit && storyId && (
        <button
          className="story-edit"
          onClick={() => setShowStoryEditForm(true)}
        >
          <BiEdit size={20} />
          Edit
        </button>
      )}

      {showStoryEditForm && showEdit && storyId && (
        <StoryCreator
          onClose={() => setShowStoryEditForm(false)}
          storyId={storyId}
        />
      )}
    </div>
  );
};

export default SlideCard;
