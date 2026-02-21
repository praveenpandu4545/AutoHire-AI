import React, { useState } from "react";
import "../css/AddCollege.css";

const AddCollege = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [collegeName, setCollegeName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!collegeName.trim()) {
      setMessage("College name cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/college/registerNewCollege`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ collegeName }),
        }
      );

      const data = await response.text();

      if (!response.ok) {
        setMessage(data);
        return;
      }

      setMessage("College added successfully ✅");
      setCollegeName("");

    } catch (error) {
      console.error(error);
      setMessage("Error adding college");
    }
  };

  return (
    <div className="add-college-container">
      <h2>Add College</h2>

      <input
        type="text"
        placeholder="Enter College Name"
        value={collegeName}
        onChange={(e) => setCollegeName(e.target.value)}
      />

      <button onClick={handleSubmit}>Add College</button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddCollege;