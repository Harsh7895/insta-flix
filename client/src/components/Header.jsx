import { useState } from "react";
import "../styles/header.css";
import LoginPopup from "./LoginPopup.jsx";
import { useDispatch, useSelector } from "react-redux";
import { IoBookmarkSharp } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { toast } from "react-hot-toast";
import {
  signOutStart,
  signOutSuccess,
  signOutFailure,
} from "../../redux/user/userSlice.js";
import StoryCreator from "./StoryCreator.jsx";
import { useNavigate } from "react-router-dom";

const bgColors = [
  "#ef9a9a", // Light Red
  "#90caf9", // Light Blue
  "#a5d6a7", // Light Green
  "#ffe082", // Light Yellow
  "#ffccbc", // Light Orange
  "#b39ddb", // Light Purple
  "#ffab91", // Light Coral
  "#80cbc4", // Light Teal
  "#f48fb1", // Light Pink
  "#e6ee9c", // Light Lime
];

const Url = "http://localhost:3000/api/v1/auth";

{
  /* eslint-disable */
}
const HamburgerToggle = ({ name, handleLogout, loading }) => {
  return (
    <div className="hamburger-toggle">
      <p>{name}</p>
      <button className="logout-btn" onClick={handleLogout} disabled={loading}>
        Logout
      </button>
    </div>
  );
};

const Header = () => {
  const [showLoginOrRegister, setShowLoginOrRegister] = useState(false);
  const [loginOrRegister, setLoginOrRegister] = useState("");
  const [showHamburgerToggle, setShowHamburgerToggle] = useState(false);
  const [showCreateStoryForm, setShowCreateStoryForm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser, loading } = useSelector((state) => state.user);

  const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];

  const handleLogout = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch(`${Url}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutFailure(data.message));
        toast.error(data.message);
        return;
      }

      setShowHamburgerToggle(false);
      toast.success("Logout successfully");
      dispatch(signOutSuccess());
    } catch (error) {
      toast.error(error.message);
      dispatch(signOutFailure(error.message));
    }
  };

  return (
    <>
      <header>
        {!currentUser ? (
          <>
            <button
              className="register-btn"
              onClick={() => {
                setShowLoginOrRegister(true);
                setLoginOrRegister("register");
              }}
            >
              Register Now
            </button>
            <button
              className="signin-btn"
              onClick={() => {
                setShowLoginOrRegister(true);
                setLoginOrRegister("login");
              }}
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            <button
              className="bookmark-btn"
              onClick={() => navigate("/bookmarks")}
            >
              <IoBookmarkSharp size={15} />
              Bookmarks
            </button>
            <button
              className="addStory-btn"
              onClick={() => setShowCreateStoryForm(true)}
            >
              Add Story
            </button>
            <span
              className="profile-btn"
              style={{
                backgroundColor: randomColor,
              }}
            >
              {currentUser?.username?.charAt(0).toUpperCase()}
            </span>

            <GiHamburgerMenu
              size={22}
              className="hamburger"
              onClick={() => setShowHamburgerToggle(!showHamburgerToggle)}
            />
          </>
        )}
      </header>
      {showLoginOrRegister && (
        <LoginPopup
          onClose={() => setShowLoginOrRegister(false)}
          loginOrRegister={loginOrRegister}
        />
      )}
      {showHamburgerToggle && (
        <HamburgerToggle
          name={currentUser?.username}
          handleLogout={handleLogout}
          loading={loading}
        />
      )}
      {showCreateStoryForm && (
        <StoryCreator onClose={() => setShowCreateStoryForm(false)} />
      )}
    </>
  );
};

export default Header;
