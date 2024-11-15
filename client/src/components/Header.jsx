import { useState } from "react";
import "../styles/header.css";
import LoginPopup from "./LoginPopup.jsx";
import { useDispatch, useSelector } from "react-redux";
import { IoBookmarkSharp } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross2 } from "react-icons/rx";
import { FaHome } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  signOutStart,
  signOutSuccess,
  signOutFailure,
} from "../../redux/user/userSlice.js";
import StoryCreator from "./StoryCreator.jsx";
import { useNavigate } from "react-router-dom";
import { formatWordsSpace } from "../utils/util.js";

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

const Url = "https://insta-flix-api.vercel.app/api/v1/auth";

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
      {currentUser && (
        <p>
          <span
            className="profile-btn btns"
            style={{ backgroundColor: randomColor }}
          >
            {currentUser?.username?.charAt(0).toUpperCase()}
          </span>
          {formatWordsSpace(name, 15)}
        </p>
      )}
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
              navigate("your-stories");
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
        <RxCross2 size={20} fontWeight={900} />
      </div>
    </div>
  );
};

const Header = () => {
  const [showLoginOrRegister, setShowLoginOrRegister] = useState(false);
  const [loginOrRegister, setLoginOrRegister] = useState("");
  const [showHamburgerToggle, setShowHamburgerToggle] = useState(false);
  const [showCreateStoryForm, setShowCreateStoryForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser } = useSelector((state) => state.user);

  const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];

  const handleLogout = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const openForm = (val) => {
    setLoginOrRegister(val);
    setShowHamburgerToggle(false);
  };

  return (
    <>
      <header className="header">
        <FaHome
          className="home-icon"
          size={20}
          color="black"
          onClick={() => navigate("/")}
        />
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
            <GiHamburgerMenu
              size={22}
              className="hamburger"
              onClick={() => setShowHamburgerToggle(!showHamburgerToggle)}
              aria-label="Menu"
              id="hamburger-not-loggedIn"
            />
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
