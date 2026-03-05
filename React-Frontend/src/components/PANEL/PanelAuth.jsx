import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/PanelAuth.css";

function PanelAuth() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    department: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PANEL",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------------------------- */
  /* Check existing login */
  /* ---------------------------------- */

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
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  /* ---------------------------------- */
  /* Login change */
  /* ---------------------------------- */

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  /* ---------------------------------- */
  /* Register change */
  /* ---------------------------------- */

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  /* ---------------------------------- */
  /* LOGIN */
  /* ---------------------------------- */

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
        body: JSON.stringify(loginData),
      });

      const token = await response.text();

      if (!response.ok) throw new Error(token);

      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "HR") {
        navigate("/hr-dashboard", { replace: true });
      } else if (role === "PANEL") {
        navigate("/panel-dashboard", { replace: true });
      } else {
        setError("You are not authorized");
        localStorage.removeItem("token");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------- */
  /* REGISTER */
  /* ---------------------------------- */

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/register/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerData.name,
          department: registerData.department,
          phone: registerData.phone,
          email: registerData.email,
          password: registerData.password,
          role: registerData.role,
        }),
      });

      const message = await response.text();

      if (!response.ok) throw new Error(message);

      setSuccess(message);

      setTimeout(() => {
        setIsLogin(true);
      }, 1500);

    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-box">

        {/* LEFT PANEL */}

        <div className="auth-left">

          {isLogin ? (
            <div className="brand-box">
              <h1>AutoHire AI</h1>
              <p>Smart Hiring Platform</p>
            </div>
          ) : (
            <form className="form-box" onSubmit={handleRegister}>

              <h2>Register</h2>

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleRegisterChange}
                required
              />

              <input
                type="text"
                name="department"
                placeholder="Department"
                onChange={handleRegisterChange}
                required
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                onChange={handleRegisterChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleRegisterChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleRegisterChange}
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleRegisterChange}
                required
              />

              <select
                name="role"
                value={registerData.role}
                onChange={handleRegisterChange}
              >
                <option value="PANEL">Panel</option>
                <option value="HR">HR</option>
              </select>

              <button disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>

              {error && <p className="error-text">{error}</p>}
              {success && <p className="success-text">{success}</p>}

              <p className="switch-text">
                Already have an account?
                <span onClick={() => setIsLogin(true)}> Login</span>
              </p>

            </form>
          )}

        </div>


        {/* RIGHT PANEL */}

        <div className="auth-right">

          {isLogin ? (
            <form className="form-box" onSubmit={handleLogin}>

              <h2>Panel / HR Login</h2>

              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                onChange={handleLoginChange}
                required
              />

              <div className="password-wrapper">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Password"
                  onChange={handleLoginChange}
                  required
                />

                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>

              </div>

              <button disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              {error && <p className="error-text">{error}</p>}

              <p className="switch-text">
                New employee?
                <span onClick={() => setIsLogin(false)}> Register</span>
              </p>

            </form>
          ) : (
            <div className="brand-box">
              <h1>AutoHire AI</h1>
              <p>Smart Hiring Platform</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default PanelAuth;