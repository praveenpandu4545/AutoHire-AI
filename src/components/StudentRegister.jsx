import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/StudentRegister.css";

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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

    const message = await response.text(); // 👈 FIX HERE

    if (!response.ok) {
      throw new Error(message);
    }

    console.log("Registration Success:", message);
    setSuccess(message);

    setTimeout(() => {
      navigate("/student-login");
    }, 1500);

  } catch (err) {
    console.error(err);
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
          onChange={handleChange}
          required
        />

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