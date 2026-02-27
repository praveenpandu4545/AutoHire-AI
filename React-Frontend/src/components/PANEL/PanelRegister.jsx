import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/PanelRegister.css";

function PanelRegister() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",   // ✅ Added
    role: "PANEL",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ✅ Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/auth/register/employee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            department: formData.department,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }), // ✅ Do NOT send confirmPassword to backend
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      setSuccess(message);

      setTimeout(() => {
        navigate("/panel-login");
      }, 1500);

    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-register-container">
      <h2>Employee Registration</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        {/* ✅ Confirm Password Field */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="PANEL">Panel</option>
          <option value="HR">HR</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </form>
    </div>
  );
}

export default PanelRegister;