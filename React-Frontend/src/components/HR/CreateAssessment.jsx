import React, { useEffect, useState } from "react";
import "../../css/CreateAssessment.css";

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const CreateAssessment = ({ onBack, editData }) => {
  const token = localStorage.getItem("token");

  const [drives, setDrives] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [domains, setDomains] = useState([]);

  const [formData, setFormData] = useState({
    driveId: "",
    roundId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    duration: "",
    totalQuestions: "",
    marksForCorrectAnswer: "",
    negativeMarks: "",
    totalMarks: "",
    passingMarks: "",
    shuffleQuestions: false,
    shuffleOptions: false,
    allowBackNavigation: true,
    autoSubmitOnTimeUp: true,
    maxAttempts: 1,
    selectedDomains: []
  });

  useEffect(() => {
  if (editData) {
    setFormData(prev => ({
      ...prev,
      title: editData.title,
      duration: editData.duration,
      totalMarks: editData.totalMarks,
      passingMarks: editData.passingMarks,
      startTime: editData.startTime?.slice(0,16),
      endTime: editData.endTime?.slice(0,16)
    }));
  }
}, [editData]);

  // ================= FETCH DRIVES =================
  useEffect(() => {
    fetch(`${BASE_URL}/springApi/drive/getAll`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setDrives)
      .catch(console.error);
  }, []);

  // ================= FETCH ROUNDS =================
  const fetchRounds = (driveId) => {
    fetch(`${BASE_URL}/springApi/round/getRoundsByDriveId/${driveId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setRounds)
      .catch(console.error);
  };

  // ================= FETCH DOMAINS =================
  useEffect(() => {
    fetch(`${BASE_URL}/api/questions/getAllDomains`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setDomains)
      .catch(console.error);
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (name === "driveId") {
      fetchRounds(value);
      setFormData(prev => ({ ...prev, roundId: "" }));
    }
  };

  // ================= DOMAIN SELECT =================
  const handleDomainChange = (domain) => {
    setFormData(prev => ({
      ...prev,
      selectedDomains: prev.selectedDomains.includes(domain)
        ? prev.selectedDomains.filter(d => d !== domain)
        : [...prev.selectedDomains, domain]
    }));
  };

  // ================= AUTO CALCULATE DURATION =================
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const diff =
        (new Date(formData.endTime) - new Date(formData.startTime)) / 60000;

      if (diff > 0) {
        setFormData(prev => ({ ...prev, duration: Math.floor(diff) }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("🔥 handleSubmit triggered");
  console.log("📤 Form Data:", formData);

  try {
    const response = await fetch(
      `${BASE_URL}/springApi/assessment/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          driveId: Number(formData.driveId),   // ✅ FIX HERE
          roundId: Number(formData.roundId),   // ✅ FIX HERE
        }),
      }
    );

    console.log("📥 Response status:", response.status);

    const text = await response.text();
    console.log("📥 Raw response:", text);

    if (!response.ok) {
      throw new Error(text);
    }

    const data = JSON.parse(text);
    console.log("✅ Success:", data);

    alert("Assessment Created Successfully!");

  } catch (err) {
    console.error("❌ Error:", err);
    alert("Error: " + err.message);
  }
};

  return (
    <div className="assessment-wrapper">

      <div className="assessment-card">

        {/* HEADER */}
        <div className="header">
          <button 
  className="back-btn" 
  onClick={onBack}
  style={{ 
    backgroundColor: 'blue', 
    color: 'white', 
    padding: '10px 20px', 
    border: 'none', 
    borderRadius: '5px',
    cursor: 'pointer' 
  }}
>
  ⬅ Back
</button>

          <h2>Create Assessment</h2>
        </div>

        <form onSubmit={handleSubmit}>

          {/* DRIVE + ROUND */}
          <div className="grid-2">
            <div>
              <label>Drive</label>
              <select name="driveId" onChange={handleChange} required>
                <option value="">Select Drive</option>
                {drives.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.driveName} - {d.collegeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Round</label>
              <select name="roundId" onChange={handleChange} required>
                <option value="">Select Round</option>
                {rounds.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.roundNumber}. {r.roundName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TITLE */}
          <label>Assessment Title</label>
          <input type="text" name="title" onChange={handleChange} required />

          {/* DESCRIPTION */}
          <label>Description</label>
          <textarea name="description" onChange={handleChange}></textarea>

          {/* DOMAINS */}
          <label>Select Domains</label>
          <div className="domain-grid">
            {domains.map((d, i) => (
              <label key={i} className="domain-item">
                <input
                  type="checkbox"
                  checked={formData.selectedDomains.includes(d)}
                  onChange={() => handleDomainChange(d)}
                />
                <span>{d}</span>
              </label>
            ))}
          </div>

          <label>Total Number of Questions</label>
                <input
                type="number"
                name="totalQuestions"
                min="1"
                placeholder="Enter number of questions (e.g., 20)"
                value={formData.totalQuestions}
                onChange={handleChange}
                required
                />

          {/* TIMING */}
          <div className="grid-2">
            <div>
              <label>Start Time</label>
              <input type="datetime-local" name="startTime" onChange={handleChange} required />
            </div>

            <div>
              <label>End Time</label>
              <input type="datetime-local" name="endTime" onChange={handleChange} required />
            </div>
          </div>

          {/* DURATION */}
          <label>Duration (minutes)</label>
          <input type="number" name="duration" value={formData.duration} onChange={handleChange} />

          {/* MARKS */}
          <div className="grid-2">
            <input type="number" name="marksForCorrectAnswer" placeholder="Marks per correct" onChange={handleChange} />
            <input type="number" name="negativeMarks" step="0.01" placeholder="Negative marks" onChange={handleChange} />
          </div>

          <div className="grid-2">
            <input type="number" name="totalMarks" placeholder="Total marks" onChange={handleChange} />
            <input type="number" name="passingMarks" placeholder="Passing marks" onChange={handleChange} />
          </div>

          {/* SETTINGS */}
          <div className="checkbox-row">
            <label><input type="checkbox" name="shuffleQuestions" onChange={handleChange}/> Shuffle Questions</label>
            <label><input type="checkbox" name="shuffleOptions" onChange={handleChange}/> Shuffle Options</label>
            <label><input type="checkbox" name="allowBackNavigation" defaultChecked onChange={handleChange}/> Allow Back</label>
            <label><input type="checkbox" name="autoSubmitOnTimeUp" defaultChecked onChange={handleChange}/> Auto Submit</label>
          </div>

          {/* SUBMIT */}
          <button className="submit-btn">Create Assessment</button>

        </form>
      </div>
    </div>
  );
};

export default CreateAssessment;