import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/StudentRegister.css";

function StudentRegister() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    department: "",
    phone: "",
    email: "",
    password: "",
    collegeName: "", // ✅ Added
  });

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchColleges();
  }, []);

  // 🔹 Fetch all colleges
  const fetchColleges = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/college/getAll`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch colleges");
      }

      const data = await response.json();
      setColleges(data);

    } catch (err) {
      console.error("College fetch failed:", err);
      setError("Unable to load colleges");
    }
  };

  // 🔹 Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${BASE_URL}/auth/register/student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message);
      }

      setSuccess(message);

      // Redirect after success
      setTimeout(() => {
        navigate("/student-login");
      }, 1500);

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Create Student Account</h2>

      <form onSubmit={handleRegister}>

        <input
          type="text"
          name="studentId"
          placeholder="Student ID"
          value={formData.studentId}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        {/* ✅ College Dropdown */}
        <select
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            required
          >
            <option value="">Select College</option>

            {colleges.map((college, index) => (
              <option
                key={`${college}-${index}`}   // ✅ Unique key
                value={college}               // ✅ Direct string
              >
                {college}
              </option>
            ))}
        </select>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </form>
    </div>
  );
}

export default StudentRegister;