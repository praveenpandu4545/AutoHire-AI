import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/StudentLogin.css";

function PanelLogin() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Prevent going back to login if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role;

        if (role === "HR") {
          navigate("/hr-dashboard", { replace: true });
        } else if (role === "PANEL") {
          navigate("/panel-dashboard", { replace: true });
        }
      } catch (err) {
        // If token is invalid, remove it
        localStorage.removeItem("token");
      }
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

      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "HR") {
        navigate("/hr-dashboard", { replace: true });   // ✅ replace
      } else if (role === "PANEL") {
        navigate("/panel-dashboard", { replace: true }); // ✅ replace
      } else {
        setError("You are not authorized as Panel/HR");
        localStorage.removeItem("token");
      }

    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Panel / HR Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="error-text">{error}</p>}
      </form>

      <p>
        New employee?{" "}
        <Link to="/panel-register">Register here</Link>
      </p>
    </div>
  );
}

export default PanelLogin;