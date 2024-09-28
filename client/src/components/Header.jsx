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
  "#ef9a9a",
  "#90caf9",
  "#a5d6a7",
  "#ffe082",
  "#ffccbc",
  "#b39ddb",
  "#ffab91",
  "#80cbc4",
  "#f48fb1",
  "#e6ee9c",
];

const Url = "http://localhost:3000/api/v1/auth";

{
  /* eslint-disable */
}
const HamburgerToggle = ({
  name,
  handleLogout,
  loading,
  currentUser,
  onClose,
  randomColor,
  openLogin,
  openStoryCreator,
  openForm,
}) => {
  const navigate = useNavigate();
  return (
    <div className="hamburger-toggle">
      <p>
        <span
          className="profile-btn btns"
          style={{ backgroundColor: randomColor }}
        >
          {currentUser?.username?.charAt(0).toUpperCase()}
        </span>
        {currentUser ? name : "Guest"}
      </p>
      {!currentUser ? (
        <>
          <button
            className="register-btn btns"
            onClick={() => {
              openLogin();
              openForm("register");
            }}
            disabled={loading}
          >
            Register Now
          </button>
          <button
            className="signin-btn btns"
            onClick={() => {
              openLogin();
              openForm("login");
            }}
            disabled={loading}
          >
            Sign In
          </button>
        </>
      ) : (
        <>
          <button
            className="addStory-btn btns"
            onClick={() => {
              navigate("add-stories");
              onClose();
            }}
          >
            Your Stories
          </button>
          <button
            className="addStory-btn btns"
            onClick={() => {
              openStoryCreator();
              onClose();
            }}
          >
            Add Story
          </button>
          <button
            className="bookmark-btn btns"
            onClick={() => {
              navigate("/bookmarks");
              onClose();
            }}
          >
            <IoBookmarkSharp size={15} />
            Bookmarks
          </button>
          <button
            className="logout-btn"
            onClick={handleLogout}
            disabled={loading}
          >
            Logout
          </button>
        </>
      )}

      <div className="close-hamburger" onClick={onClose}>
        X
      </div>
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
      if (!data.success) {
        dispatch(signOutFailure(data.message));
        toast.error(data.message);
        return;
      }

      setShowHamburgerToggle(false);
      toast.success("Logout successfully");
      dispatch(signOutSuccess());
      navigate("/");
    } catch (error) {
      toast.error(error.message);
      dispatch(signOutFailure(error.message));
    }
  };

  const openForm = (val) => {
    setLoginOrRegister(val);
    setShowHamburgerToggle(false);
  };

  return (
    <>
      <header className="header">
        {!currentUser ? (
          <>
            <button
              className="register-btn btns"
              onClick={() => {
                setShowLoginOrRegister(true);
                setLoginOrRegister("register");
              }}
              disabled={loading}
              aria-label="Register Now"
            >
              Register Now
            </button>
            <button
              className="signin-btn btns"
              onClick={() => {
                setShowLoginOrRegister(true);
                setLoginOrRegister("login");
              }}
              disabled={loading}
              aria-label="Sign In"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            <button
              className="bookmark-btn btns"
              onClick={() => navigate("/bookmarks")}
              disabled={loading}
              aria-label="Bookmarks"
            >
              <IoBookmarkSharp size={15} />
              Bookmarks
            </button>
            <button
              className="addStory-btn btns"
              onClick={() => setShowCreateStoryForm(true)}
              disabled={loading}
              aria-label="Add Story"
            >
              Add Story
            </button>
            <span
              className="profile-btn btns"
              style={{ backgroundColor: randomColor }}
            >
              {currentUser?.username?.charAt(0).toUpperCase()}
            </span>

            <GiHamburgerMenu
              size={22}
              className="hamburger"
              onClick={() => setShowHamburgerToggle(!showHamburgerToggle)}
              aria-label="Menu"
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
          onClose={() => setShowHamburgerToggle(false)}
          currentUser={currentUser}
          randomColor={randomColor}
          openLogin={() => setShowLoginOrRegister(true)}
          openStoryCreator={() => setShowCreateStoryForm(true)}
          openForm={openForm}
        />
      )}
      {showCreateStoryForm && (
        <StoryCreator onClose={() => setShowCreateStoryForm(false)} />
      )}
    </>
  );
};

export default Header;
