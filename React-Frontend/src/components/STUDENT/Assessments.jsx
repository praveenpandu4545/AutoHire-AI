import React, { useEffect, useState } from "react";
import "../../css/MyAssessments.css";

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/springApi/assessment/getStudentAssessments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assessments");
      }

      const data = await response.json();
      setAssessments(data);

    } catch (err) {
      console.error(err);
      setError("Unable to load assessments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessments-container">
      <h2 className="title">My Assessments</h2>

      {loading && <p className="status-text">Loading assessments...</p>}

      {error && <p className="error-text">{error}</p>}

      {!loading && !error && assessments.length === 0 && (
        <p className="status-text">No assessments available</p>
      )}

      <div className="cards">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="card">
            <h3>{assessment.assessmentName}</h3>

            <button className="view-btn">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;