import React, { useState, useRef } from 'react';
import '../../css/AddQuestion.css';

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const AddQuestion = ({ onBack }) => {

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    domain: '',
    difficulty: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const updated = [...formData.options];
    updated[index] = value;
    setFormData({ ...formData, options: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/questions/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error();
      setMessage('success');

    } catch {
      setMessage('error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem("token");

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${BASE_URL}/api/questions/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });

      if (!res.ok) throw new Error();
      setMessage('upload');

    } catch {
      setMessage('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aq-page">

      {/* 🔥 HEADER */}
      <div className="aq-header">
        <button className="aq-back" onClick={onBack}>← Back</button>

        <h2>Add Question</h2>

        <button
          className="aq-upload"
          onClick={() => fileInputRef.current.click()}
        >
          Upload Excel
        </button>

        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
        />
      </div>

      {/* 🔥 FORM CARD */}
      <div className="aq-card">

        <form onSubmit={handleSubmit}>

          {/* SECTION 1 */}
          <div className="aq-section">
            <label>Question</label>
            <textarea
              name="questionText"
              placeholder="Enter your question..."
              value={formData.questionText}
              onChange={handleChange}
              required
            />
          </div>

          {/* SECTION 2 */}
          <div className="aq-section">
            <label>Options</label>

            <div className="aq-options">
              {formData.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  required
                />
              ))}
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="aq-grid">
            <div>
              <label>Correct Answer</label>
              <input
                type="text"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Domain</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* ACTION */}
          <button className="aq-submit" disabled={loading}>
            {loading ? "Processing..." : "Save Question"}
          </button>

          {/* MESSAGE */}
          {message === "success" && <p className="aq-success">Saved successfully</p>}
          {message === "upload" && <p className="aq-success">Excel uploaded</p>}
          {message === "error" && <p className="aq-error">Something failed</p>}

        </form>

      </div>
    </div>
  );
};

export default AddQuestion;