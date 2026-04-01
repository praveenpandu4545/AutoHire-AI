import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/StudentAssessments.css";

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null); // kept (not breaking)
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/assessment/getStudentAssessments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setAssessments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS =================
  const getStatus = (startTime, endTime) => {
    const now = time;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return "NOT_STARTED";
    if (now >= start && now <= end) return "ACTIVE";
    return "ENDED";
  };

  // ================= COUNTDOWN =================
  const getCountdown = (startTime) => {
    const now = time;
    const start = new Date(startTime);
    const diff = start - now;

    if (diff <= 0) return "Started";

    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(mins / 60);

    return hours > 0
      ? `${hours}h ${mins % 60}m`
      : `${mins} mins`;
  };

  return (
    <div className="assessments-page">
      <h2 className="page-title">My Assessments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="assessment-grid">
          {assessments.map((item) => {
            const examStatus = getStatus(item.startTime, item.endTime);

            const isAttempted = item.status === "COMPLETED";
            const isInProgress = item.status === "IN_PROGRESS";

            return (
              <div key={item.id} className="card">

                {/* LEFT */}
                <div className="card-left">
                  <h3>{item.title}</h3>
                  <p className="desc">{item.description}</p>
                </div>

                {/* MIDDLE */}
                <div className="card-middle">
                  <span className={`badge ${examStatus}`}>
                    {examStatus === "ACTIVE" && "ACTIVE"}
                    {examStatus === "NOT_STARTED" && "UPCOMING"}
                    {examStatus === "ENDED" && "ENDED"}
                  </span>

                  {examStatus === "NOT_STARTED" && (
                    <p className="timer">
                      ⏳ Starts in {getCountdown(item.startTime)}
                    </p>
                  )}

                  <div className="attempt-box">
                    {isAttempted && <span className="done">✔ Attempted</span>}
                    {isInProgress && <span className="progress">⏳ In Progress</span>}
                    {!isAttempted && !isInProgress && (
                      <span className="not">✖ Not Attempted</span>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="card-right">
                  <button
                    className="start-btn"
                    disabled={examStatus !== "ACTIVE" || isAttempted}
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `${BASE_URL}/springApi/assessment/${item.assessmentId}`,
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );

                        const fullAssessment = await response.json();

                        // 🚀 NAVIGATE TO FULL SCREEN EXAM
                        navigate("/exam", {
                          state: { assessment: fullAssessment },
                        });

                        // kept (no breaking, but not used anymore)
                        setSelectedAssessment(fullAssessment);

                      } catch (err) {
                        console.error(err);
                        alert("Failed to load test");
                      }
                    }}
                  >
                    {isAttempted
                      ? "Completed"
                      : examStatus === "ACTIVE"
                      ? "Start Test"
                      : "Unavailable"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assessments;