import { useNavigate } from "react-router-dom";
import "../css/Opening.css";

function Opening() {
  const navigate = useNavigate();

  return (
    <div className="opening-container">
      <h1 className="app-title">AutoHire AI</h1>

      <p className="tagline">
        Intelligent Hiring. Simplified.
      </p>

      <h3 className="question">Are you?</h3>

      <div className="button-group">
        <button 
          className="role-button student-btn"
          onClick={() => navigate("/Student-Auth")}
        >
          🎓 Student
        </button>

        <button 
          className="role-button panel-btn"
          onClick={() => navigate("/Panel-Auth")}
        >
          👨‍💼 Panel
        </button>
      </div>
    </div>
  );
}

export default Opening;