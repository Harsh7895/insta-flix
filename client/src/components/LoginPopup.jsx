import { useEffect, useState } from "react";
import "../styles/login.css";
import { toast } from "react-hot-toast";
import {
  signInStart,
  signInFailure,
  signInSuccess,
} from "../../redux/user/userSlice";
import { useDispatch } from "react-redux";

const Url = "http://localhost:3000/api/v1/auth";

{
  /* eslint-disable */
}
const LoginPopup = ({ onClose, loginOrRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsernname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => document.body.classList.remove("no-scroll");
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const capitalizedWord =
    loginOrRegister.charAt(0).toUpperCase() + loginOrRegister.slice(1);

  const handleRegisterOrLogin = async () => {
    if (!username.trim()) {
      setError("Please enter the username first");
      return;
    }
    if (!password.trim()) {
      setError("Please enter the password first");
      return;
    }

    try {
      setLoading(true);
      if (loginOrRegister === "login") dispatch(signInStart());
      const res = await fetch(`${Url}/${loginOrRegister}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success === false) {
        toast.error(data.message);
        return;
      }

      if (loginOrRegister === "login") {
        dispatch(signInSuccess({ token: data.token, ...data.rest }));
      }

      toast.success(data.message);

      setUsernname("");
      setPassword("");
      onClose();
      setError("");
    } catch (error) {
      setError(error.message);
      if (loginOrRegister === "login")
        dispatch(signInFailure(error.message || "Failed to sign in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-popup">
        <button className="close-button" onClick={onClose}>
          <img src="/Vector.jpg" alt="cross" />
        </button>
        <h2>{capitalizedWord}</h2>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="login-input"
            placeholder="Enter username"
            onChange={(e) => setUsernname(e.target.value)}
            value={username}
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter password"
              className="login-input"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              disabled={loading}
            />
            <button
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        <button
          className="login-button"
          onClick={handleRegisterOrLogin}
          disabled={loading}
        >
          {capitalizedWord}
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
