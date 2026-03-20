import React, { useState } from 'react';
import AddQuestion from './AddQuestion';
import AllQuestions from './AllQuestions';
import '../../css/Assessments.css';

const Assessments = () => {

  const [view, setView] = useState("home");

  return (
    <div className="assessments-container">

      {view === "home" && (
        <>
          <h2>Assessments</h2>

          <div className="btn-group">
            <button 
              className="add-question-btn"
              onClick={() => setView("add")}
            >
              ➕ Add Question
            </button>

            <button 
              className="view-question-btn"
              onClick={() => setView("view")}
            >
              👁 Questions
            </button>
          </div>
        </>
      )}

      {view === "add" && (
        <AddQuestion onBack={() => setView("home")} />
      )}

      {view === "view" && (
        <AllQuestions onBack={() => setView("home")} />
      )}

    </div>
  );
};

export default Assessments;