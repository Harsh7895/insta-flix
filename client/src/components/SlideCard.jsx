import "../styles/slidecard.css";

{
  /* eslint-disable */
}
const SlideCard = ({
  heading,
  description,
  mediaSrc,
  storyId = "",
  slideId = "",
  onOpenStoryViewer, // Accept the function to open story viewer
}) => {
  return (
    <div
      className="story-card"
      onClick={() => onOpenStoryViewer(storyId, slideId)}
    >
      <img src={mediaSrc} alt="Story" />
      <div className="story-description">
        <h3>{heading}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default SlideCard;
