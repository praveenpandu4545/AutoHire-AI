import { useNavigate } from "react-router-dom";
import "../css/Opening.css";

function Opening() {
  const navigate = useNavigate();

  return (
    <div className="opening-page">
      <div className="opening-overlay">
        <main className="opening-hero-card">
          <p className="opening-badge">AI Recruiting Platform</p>
          <h1 className="opening-title">AutoHire AI</h1>
          <p className="opening-tagline">Intelligent Hiring. Simplified.</p>
          <p className="opening-description">
            Streamline your hiring process with AI-powered resume analysis,
            automated eligibility checks, and structured interview workflows.
            Whether you're a student seeking opportunities or a panel managing
            interviews — everything is handled seamlessly.
          </p>
          <div className="opening-button-group">
            <button
              className="opening-role-button student-btn"
              onClick={() => navigate("/Student-Auth")}
            >
              <span className="opening-role-emoji" aria-hidden="true">
                🎓
              </span>
              Student
            </button>

            <button
              className="opening-role-button panel-btn"
              onClick={() => navigate("/Panel-Auth")}
            >
              <span className="opening-role-emoji" aria-hidden="true">
                👨‍💼
              </span>
              Panel
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Opening;