import { useState } from "react";
import "../styles/home.css";

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
  const handleSelect = (item) => {
    if (active.includes(item)) {
      setActive(active.filter((category) => category !== item));
    } else {
      setActive([...active, item]);
    }
  };

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

      <h2>Top Stories About food</h2>
      <div className="stories-grid">
        {/* {[1, 2, 3, 4].map((item) => (
          <div key={item} className="story-card">
            <img src="/placeholder.svg?height=200&width=300" alt="Story" />
            <h3>Heading comes here</h3>
            <p>
              Inspirational designs, illustrations, and graphic elements from
              the world{"'"}s best designers.
            </p>
          </div>
        ))} */}

        <div className="no-stories">No Stories Available</div>
      </div>

      <button className="see-more-btn">See more</button>

      <h2>Top Stories About food</h2>
      <div className="stories-grid">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="story-card">
            <img
              src="https://th.bing.com/th?id=OIP.Fw-199hoU0qcuFHEL9Vf8wHaLH&w=204&h=306&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2"
              alt="Story"
            />
            <div className="story-description">
              <h3>Heading comes here</h3>
              <p>
                Inspirational designs, illustrations, and graphic elements from
                the world{"'"}s best designers.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
