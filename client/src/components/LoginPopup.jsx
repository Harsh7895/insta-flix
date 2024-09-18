import { useState } from "react";
import "../styles/login.css";
import { toast } from "react-hot-toast";

const Url = "http://localhost:3000/api/v1/user";

{
  /* eslint-disable */
}
const LoginPopup = ({ onClose, loginOrRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsernname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const capitalizedWord =
    loginOrRegister.charAt(0).toUpperCase() + loginOrRegister.slice(1);

  const handleRegisterOrLogin = async () => {
    try {
      setLoading(true);
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
        localStorage.setItem("token", data.token);
      }

      toast.success(data.message);

      setUsernname("");
      setPassword("");
      onClose();
    } catch (error) {
      toast.error(error.message);
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
