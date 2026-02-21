import React, { useState, useEffect } from "react";
import "../css/CreateDrive.css";

const CreateDrive = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [form, setForm] = useState({
    collegeName: "",
    driveName: "",
    noOfRounds: 1,
    rounds: [{ roundNumber: 1, roundName: "" }],
    requiredSkills: [],
  });

  const [skillInput, setSkillInput] = useState("");
  const [message, setMessage] = useState("");
  const [colleges, setColleges] = useState([]);

  // Handle basic input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle number of rounds change
  const handleRoundsChange = (e) => {
    const count = parseInt(e.target.value);
    let newRounds = [];

    for (let i = 1; i <= count; i++) {
      newRounds.push({ roundNumber: i, roundName: "" });
    }

    setForm({ ...form, noOfRounds: count, rounds: newRounds });
  };

  // Handle round name change
  const handleRoundNameChange = (index, value) => {
    const updatedRounds = [...form.rounds];
    updatedRounds[index].roundName = value;
    setForm({ ...form, rounds: updatedRounds });
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() === "") return;

    setForm({
      ...form,
      requiredSkills: [...form.requiredSkills, skillInput],
    });

    setSkillInput("");
  };

  // Remove skill
  const removeSkill = (index) => {
    const updatedSkills = form.requiredSkills.filter((_, i) => i !== index);
    setForm({ ...form, requiredSkills: updatedSkills });
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/drive/CreateDrive`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.text();

      if (!response.ok) {
        setMessage(data);
        return;
      }

      setMessage("Drive created successfully ✅");

      // Reset form
      setForm({
        collegeName: "",
        driveName: "",
        noOfRounds: 1,
        rounds: [{ roundNumber: 1, roundName: "" }],
        requiredSkills: [],
      });

    } catch (error) {
      console.error(error);
      setMessage("Error creating drive");
    }
  };

  useEffect(() => {
  fetchColleges();
}, []);

const fetchColleges = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${BASE_URL}/springApi/college/getAll`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    setColleges(data);

  } catch (error) {
    console.error("Error fetching colleges", error);
  }
};

  return (
    <div className="create-drive-container">
      <h2>Create Drive</h2>

      <select
            name="collegeName"
            value={form.collegeName}
            onChange={handleChange}
            >
            <option value="">Select College</option>
            {colleges.map((clg, index) => (
                <option key={index} value={clg}>
                {clg}
                </option>
            ))}
        </select>

      <input
        type="text"
        name="driveName"
        placeholder="Drive Name"
        value={form.driveName}
        onChange={handleChange}
      />

      <input
        type="number"
        name="noOfRounds"
        min="1"
        value={form.noOfRounds}
        onChange={handleRoundsChange}
      />

      <h3>Rounds</h3>
      {form.rounds.map((round, index) => (
        <div key={index} className="round-input">
          <span>Round {round.roundNumber}</span>
          <input
            type="text"
            placeholder="Round Name"
            value={round.roundName}
            onChange={(e) =>
              handleRoundNameChange(index, e.target.value)
            }
          />
        </div>
      ))}

      <h3>Required Skills</h3>
      <div className="skill-section">
        <input
          type="text"
          placeholder="Enter skill"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
        />
        <button type="button" onClick={addSkill}>
          Add
        </button>
      </div>

      <ul className="skill-list">
        {form.requiredSkills.map((skill, index) => (
          <li key={index}>
            {skill}
            <button onClick={() => removeSkill(index)}>X</button>
          </li>
        ))}
      </ul>

      <button className="submit-btn" onClick={handleSubmit}>
        Create Drive
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default CreateDrive;