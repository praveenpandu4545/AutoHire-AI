import React, { useEffect, useState } from 'react';
import '../../css/AllQuestions.css';

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const AllQuestions = ({ onBack }) => {

  const [questions, setQuestions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [domains, setDomains] = useState([]);
  const [difficulties, setDifficulties] = useState([]);

  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/questions/getAll`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      setQuestions(data);
      setFiltered(data);

      const uniqueDomains = [...new Set(data.map(q => q.domain))];
      const uniqueDifficulties = [...new Set(data.map(q => q.difficulty))];

      setDomains(uniqueDomains);
      setDifficulties(uniqueDifficulties);

      // ✅ default all selected
      setSelectedDomains(uniqueDomains);
      setSelectedDifficulties(uniqueDifficulties);

    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Combined filtering (search + filters)
  useEffect(() => {
    let result = questions;

    result = result.filter(q =>
      selectedDomains.includes(q.domain) &&
      selectedDifficulties.includes(q.difficulty)
    );

    if (searchTerm.trim() !== "") {
      result = result.filter(q =>
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFiltered(result);

  }, [selectedDomains, selectedDifficulties, searchTerm, questions]);

  const handleCheckbox = (value, type) => {

    if (type === "domain") {
      setSelectedDomains(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    } else {
      setSelectedDifficulties(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };

  return (
    <div className="all-questions-container">

      <button className="back-btn" onClick={onBack}>⬅ Back</button>

      <h2>All Questions</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search questions..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 🔽 Filters */}
      <div className="filter-bar">

        {/* Domain */}
        <div className="dropdown">
          <button onClick={() => setShowDomainDropdown(!showDomainDropdown)}>
            Domain ⬇
          </button>

          {showDomainDropdown && (
            <div className="dropdown-content">
              {domains.map(domain => (
                <label key={domain}>
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(domain)}
                    onChange={() => handleCheckbox(domain, "domain")}
                  />
                  {domain}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div className="dropdown">
          <button onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}>
            Difficulty ⬇
          </button>

          {showDifficultyDropdown && (
            <div className="dropdown-content">
              {difficulties.map(diff => (
                <label key={diff}>
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes(diff)}
                    onChange={() => handleCheckbox(diff, "difficulty")}
                  />
                  {diff}
                </label>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Questions */}
      <div className="questions-list">
        {filtered.map(q => (
          <div key={q.id} className="question-card">
            <p><strong>Q:</strong> {q.questionText}</p>

            <ul>
              {q.options.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>

            <p><strong>Domain:</strong> {q.domain}</p>
            <p><strong>Difficulty:</strong> {q.difficulty}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AllQuestions;