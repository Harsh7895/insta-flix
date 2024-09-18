import { useState } from "react";
import "../styles/header.css";
import LoginPopup from "./LoginPopup.jsx";
const Header = () => {
  const [showLoginOrRegister, setShowLoginOrRegister] = useState(false);
  const [loginOrRegister, setLoginOrRegister] = useState("");
  return (
    <>
      <header>
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
      </header>
      {showLoginOrRegister && (
        <LoginPopup
          onClose={() => setShowLoginOrRegister(false)}
          loginOrRegister={loginOrRegister}
        />
      )}
    </>
  );
};

export default Header;
