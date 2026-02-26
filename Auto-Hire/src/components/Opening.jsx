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
          onClick={() => navigate("/student-login")}
        >
          🎓 Student
        </button>

        <button 
          className="role-button panel-btn"
          onClick={() => navigate("/panel-login")}
        >
          👨‍💼 Panel
        </button>
      </div>
    </div>
  );
}

export default Opening;