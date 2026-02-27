import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../css/StudentLogin.css";

function StudentLogin() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false); // ✅ NEW
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || token.split(".").length !== 3) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "STUDENT") {
        navigate("/student-dashboard");
      }
    } catch (err) {
      localStorage.clear();
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const token = await response.text();

      if (!response.ok) {
        throw new Error(token);
      }

      if (!token || token.split(".").length !== 3) {
        throw new Error("Invalid token received from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("email", formData.email);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "STUDENT") {
        navigate("/student-dashboard");
      } else if (role === "PANEL") {
        navigate("/panel-dashboard");
      } else if (role === "HR") {
        navigate("/hr-dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Student Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* ✅ Password with Eye Toggle */}
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="error-text">{error}</p>}
      </form>

      <p className="register-link">
        Don’t have an account?{" "}
        <Link to="/student-register">Create Account</Link>
      </p>
    </div>
  );
}

export default StudentLogin;