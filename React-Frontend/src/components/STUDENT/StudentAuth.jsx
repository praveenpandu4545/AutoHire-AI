import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/PanelAuth.css";

function StudentAuth() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [isLogin, setIsLogin] = useState(true);

  const [colleges, setColleges] = useState([]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    studentId: "",
    name: "",
    department: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------------------------- */
  /* AUTO LOGIN CHECK */
  /* ---------------------------------- */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || token.split(".").length !== 3) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      if (role === "STUDENT") {
        navigate("/student-dashboard");
      }
    } catch {
      localStorage.clear();
    }
  }, [navigate]);

  /* ---------------------------------- */
  /* FETCH COLLEGES */
  /* ---------------------------------- */

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await fetch(`${BASE_URL}/springApi/college/getAll`);

      if (!response.ok) throw new Error("Failed to fetch colleges");

      const data = await response.json();
      setColleges(data);

    } catch (err) {
      setError("Unable to load colleges");
    }
  };

  /* ---------------------------------- */
  /* INPUT HANDLERS */
  /* ---------------------------------- */

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

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

      if (!token || token.split(".").length !== 3) {
        throw new Error("Invalid token received from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("email", loginData.email);

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
      const response = await fetch(`${BASE_URL}/auth/register/student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: registerData.studentId,
          name: registerData.name,
          department: registerData.department,
          phone: registerData.phone,
          email: registerData.email,
          password: registerData.password,
          collegeName: registerData.collegeName,
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

      <div className={`auth-box ${isLogin ? "login-mode" : "register-mode"}`}>

        {/* LEFT PANEL */}

        <div className="auth-left">

          {isLogin ? (
            <div className="brand-box">
              <h1>AutoHire AI</h1>
              <p>Smart Hiring Platform</p>
            </div>
          ) : (

            <form className="form-box" onSubmit={handleRegister}>

              <h2>Student Register</h2>

              <input
                type="text"
                name="studentId"
                placeholder="Student ID"
                onChange={handleRegisterChange}
                required
              />

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

              <select
                name="collegeName"
                onChange={handleRegisterChange}
                required
              >
                <option value="">Select College</option>

                {colleges.map((college, index) => (
                  <option key={index} value={college}>
                    {college}
                  </option>
                ))}
              </select>

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

              <h2>Student Login</h2>

              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleLoginChange}
                required
              />

              <div className="password-wrapper">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
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
                Don't have an account?
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

export default StudentAuth;