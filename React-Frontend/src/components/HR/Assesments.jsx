import React, { useState } from 'react';
import AddQuestion from './AddQuestion';
import AllQuestions from './AllQuestions';
import CreateAssessment from './CreateAssessment';
import AllAssessments from './AllAssessments';
import '../../css/Assessments.css';

const Assessments = () => {

  const [view, setView] = useState("home");
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const renderView = () => {
    switch (view) {
      case "add":
        return <AddQuestion onBack={() => setView("home")} />;

      case "view":
        return <AllQuestions onBack={() => setView("home")} />;

      case "createAssessment":
        return <CreateAssessment onBack={() => setView("home")} />;

      case "allAssessments":
        return (
          <AllAssessments
            onBack={() => setView("home")}
            onEdit={(assessment) => {
              setSelectedAssessment(assessment);
              setView("editAssessment");
            }}
          />
        );

      case "editAssessment":
        return (
          <CreateAssessment
            onBack={() => setView("home")}
            editData={selectedAssessment}   // ✅ PASS DATA
          />
        );  

      default:
        return (
          <div className="assessment-home">
            <h2>Assessment Management</h2>

            <div className="card-grid">

              <div className="card" onClick={() => setView("add")}>
                <button>➕ Add Question</button>

              </div>

              <div className="card" onClick={() => setView("view")}>
                <button>👁 View Questions</button>
              </div>

              <div className="card" onClick={() => setView("createAssessment")}>
                <button>📝 Create Assessment</button>
              </div>

              <div className="card highlight" onClick={() => setView("allAssessments")}>
                <button>📊 View Assessments</button>
              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="assessments-container">
      {renderView()}
    </div>
  );
};

export default Assessments;